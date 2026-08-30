using System.IO.Compression;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using PDV.Dominio.Entidades;
using PDV.Dominio.Excecoes;
using PDV.Infraestrutura.Contexto;

namespace PDV.WebApi.Backup;

public class ServicoBackup
{
    public const string Formato = "BRINKPDV_BACKUP";
    public const int VersaoAtual = 1;

    private readonly PdvDbContext _contexto;
    private readonly ILogger<ServicoBackup> _logger;

    private static readonly JsonSerializerOptions OpcoesJson = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public ServicoBackup(PdvDbContext contexto, ILogger<ServicoBackup> logger)
    {
        _contexto = contexto;
        _logger = logger;
    }

    public async Task<(byte[] Conteudo, string NomeArquivo, ManifestBackupDto Manifest)> CriarAsync(
        CancellationToken cancelamento = default)
    {
        var banco = await CarregarBancoAsync(cancelamento);
        var loja = banco.ConfiguracoesLoja.FirstOrDefault();
        var manifest = CriarManifest(banco, loja);
        var nomeArquivo = CriarNomeArquivo(loja?.NomeLoja ?? "Loja", manifest.CreatedAt);

        using var memoria = new MemoryStream();
        using (var zip = new ZipArchive(memoria, ZipArchiveMode.Create, leaveOpen: true))
        {
            await EscreverJsonAsync(zip, "manifest.json", manifest, cancelamento);
            await EscreverJsonAsync(zip, "database/usuarios.json", banco.Usuarios, cancelamento);
            await EscreverJsonAsync(zip, "database/configuracoes_loja.json", banco.ConfiguracoesLoja, cancelamento);
            await EscreverJsonAsync(zip, "database/clientes.json", banco.Clientes, cancelamento);
            await EscreverJsonAsync(zip, "database/vendedores.json", banco.Vendedores, cancelamento);
            await EscreverJsonAsync(zip, "database/categorias.json", banco.Categorias, cancelamento);
            await EscreverJsonAsync(zip, "database/produtos.json", banco.Produtos, cancelamento);
            await EscreverJsonAsync(zip, "database/servicos.json", banco.Servicos, cancelamento);
            await EscreverJsonAsync(zip, "database/vendas.json", banco.Vendas, cancelamento);
            await EscreverJsonAsync(zip, "database/ordens_servico.json", banco.OrdensServico, cancelamento);
            await EscreverJsonAsync(zip, "database/movimentos_caixa.json", banco.MovimentosCaixa, cancelamento);
        }

        return (memoria.ToArray(), nomeArquivo, manifest);
    }

    public async Task<ResumoBackupDto> ValidarAsync(Stream arquivo, string nomeArquivo, CancellationToken cancelamento = default)
    {
        if (!nomeArquivo.EndsWith(".brinkbackup", StringComparison.OrdinalIgnoreCase))
        {
            throw new RegraNegocioException("O arquivo precisa ter extensão .brinkbackup.");
        }

        var pacote = await LerPacoteAsync(arquivo, cancelamento);
        ValidarPacote(pacote);
        return new ResumoBackupDto(pacote.Manifest, nomeArquivo);
    }

    public async Task<ResultadoRestoreDto> RestaurarAsync(
        Stream arquivo,
        string nomeArquivo,
        CancellationToken cancelamento = default)
    {
        if (!nomeArquivo.EndsWith(".brinkbackup", StringComparison.OrdinalIgnoreCase))
        {
            throw new RegraNegocioException("O arquivo precisa ter extensão .brinkbackup.");
        }

        var pacote = await LerPacoteAsync(arquivo, cancelamento);
        ValidarPacote(pacote);

        var backupPreventivo = await SalvarBackupPreventivoAsync(cancelamento);

        await using var transacao = await _contexto.Database.BeginTransactionAsync(cancelamento);

        try
        {
            await LimparBancoAsync(cancelamento);
            RestaurarBanco(pacote.Banco);
            await _contexto.SaveChangesAsync(cancelamento);
            await transacao.CommitAsync(cancelamento);

            return new ResultadoRestoreDto(
                pacote.Manifest,
                backupPreventivo,
                "Backup restaurado com sucesso.");
        }
        catch
        {
            await transacao.RollbackAsync(cancelamento);
            throw;
        }
    }

    private async Task<BackupBanco> CarregarBancoAsync(CancellationToken cancelamento)
    {
        var produtos = await _contexto.Produtos.AsNoTracking().OrderBy(produto => produto.Nome).ToListAsync(cancelamento);

        return new BackupBanco
        {
            Usuarios = await _contexto.Usuarios.AsNoTracking().OrderBy(usuario => usuario.NomeUsuario).ToListAsync(cancelamento),
            ConfiguracoesLoja = await _contexto.ConfiguracoesLoja.AsNoTracking().OrderBy(configuracao => configuracao.NomeLoja).ToListAsync(cancelamento),
            Clientes = await _contexto.Clientes.AsNoTracking().OrderBy(cliente => cliente.Nome).ToListAsync(cancelamento),
            Vendedores = await _contexto.Vendedores.AsNoTracking().OrderBy(vendedor => vendedor.Nome).ToListAsync(cancelamento),
            Categorias = produtos
                .Select(produto => produto.Categoria.Trim())
                .Where(categoria => !string.IsNullOrWhiteSpace(categoria))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(categoria => categoria)
                .ToList(),
            Produtos = produtos,
            Servicos = await _contexto.Servicos.AsNoTracking().OrderBy(servico => servico.Nome).ToListAsync(cancelamento),
            Vendas = await _contexto.Vendas.AsNoTracking().OrderBy(venda => venda.CriadoEm).ToListAsync(cancelamento),
            OrdensServico = await _contexto.OrdensServico.AsNoTracking().OrderBy(ordem => ordem.Numero).ToListAsync(cancelamento),
            MovimentosCaixa = await _contexto.MovimentosCaixa.AsNoTracking().OrderBy(movimento => movimento.CriadoEm).ToListAsync(cancelamento),
        };
    }

    private ManifestBackupDto CriarManifest(BackupBanco banco, ConfiguracaoLoja? loja)
    {
        var registros = new Dictionary<string, int>
        {
            ["usuarios"] = banco.Usuarios.Count,
            ["configuracoesLoja"] = banco.ConfiguracoesLoja.Count,
            ["clientes"] = banco.Clientes.Count,
            ["vendedores"] = banco.Vendedores.Count,
            ["categorias"] = banco.Categorias.Count,
            ["produtos"] = banco.Produtos.Count,
            ["servicos"] = banco.Servicos.Count,
            ["vendas"] = banco.Vendas.Count,
            ["ordensServico"] = banco.OrdensServico.Count,
            ["movimentosCaixa"] = banco.MovimentosCaixa.Count,
        };

        return new ManifestBackupDto(
            Formato,
            VersaoAtual,
            DateTime.UtcNow,
            Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "1.0.0",
            loja?.Id,
            string.IsNullOrWhiteSpace(loja?.NomeLoja) ? "BRINKPDV" : loja.NomeLoja,
            registros);
    }

    private static async Task EscreverJsonAsync<T>(
        ZipArchive zip,
        string caminho,
        T dados,
        CancellationToken cancelamento)
    {
        var entrada = zip.CreateEntry(caminho, CompressionLevel.Optimal);
        await using var stream = entrada.Open();
        await JsonSerializer.SerializeAsync(stream, dados, OpcoesJson, cancelamento);
    }

    private static async Task<T> LerJsonAsync<T>(
        ZipArchive zip,
        string caminho,
        CancellationToken cancelamento)
    {
        var entrada = zip.GetEntry(caminho)
            ?? throw new RegraNegocioException($"Arquivo obrigatório ausente no backup: {caminho}.");

        await using var stream = entrada.Open();
        return await JsonSerializer.DeserializeAsync<T>(stream, OpcoesJson, cancelamento)
            ?? throw new RegraNegocioException($"Arquivo inválido no backup: {caminho}.");
    }

    private async Task<BackupPacote> LerPacoteAsync(Stream arquivo, CancellationToken cancelamento)
    {
        try
        {
            using var zip = new ZipArchive(arquivo, ZipArchiveMode.Read, leaveOpen: true);
            var manifest = await LerJsonAsync<ManifestBackupDto>(zip, "manifest.json", cancelamento);
            var banco = new BackupBanco
            {
                Usuarios = await LerJsonAsync<List<Usuario>>(zip, "database/usuarios.json", cancelamento),
                ConfiguracoesLoja = await LerJsonAsync<List<ConfiguracaoLoja>>(zip, "database/configuracoes_loja.json", cancelamento),
                Clientes = await LerJsonAsync<List<Cliente>>(zip, "database/clientes.json", cancelamento),
                Vendedores = await LerJsonAsync<List<Vendedor>>(zip, "database/vendedores.json", cancelamento),
                Categorias = await LerJsonAsync<List<string>>(zip, "database/categorias.json", cancelamento),
                Produtos = await LerJsonAsync<List<Produto>>(zip, "database/produtos.json", cancelamento),
                Servicos = await LerJsonAsync<List<Servico>>(zip, "database/servicos.json", cancelamento),
                Vendas = await LerJsonAsync<List<Venda>>(zip, "database/vendas.json", cancelamento),
                OrdensServico = await LerJsonAsync<List<OrdemServico>>(zip, "database/ordens_servico.json", cancelamento),
                MovimentosCaixa = await LerJsonAsync<List<MovimentoCaixa>>(zip, "database/movimentos_caixa.json", cancelamento),
            };

            return new BackupPacote(manifest, banco);
        }
        catch (InvalidDataException excecao)
        {
            _logger.LogWarning(excecao, "Arquivo de backup inválido.");
            throw new RegraNegocioException("O arquivo não é um backup BRINKPDV válido.");
        }
        catch (JsonException excecao)
        {
            _logger.LogWarning(excecao, "JSON inválido no arquivo de backup.");
            throw new RegraNegocioException("O backup possui dados corrompidos ou incompatíveis.");
        }
    }

    private static void ValidarPacote(BackupPacote pacote)
    {
        if (pacote.Manifest.Format != Formato)
        {
            throw new RegraNegocioException("Formato de backup incompatível.");
        }

        if (pacote.Manifest.Version != VersaoAtual)
        {
            throw new RegraNegocioException($"Versão de backup incompatível: {pacote.Manifest.Version}.");
        }

        ValidarIdsUnicos("usuarios", pacote.Banco.Usuarios.Select(item => item.Id));
        ValidarIdsUnicos("clientes", pacote.Banco.Clientes.Select(item => item.Id));
        ValidarIdsUnicos("vendedores", pacote.Banco.Vendedores.Select(item => item.Id));
        ValidarIdsUnicos("produtos", pacote.Banco.Produtos.Select(item => item.Id));
        ValidarIdsUnicos("servicos", pacote.Banco.Servicos.Select(item => item.Id));
        ValidarIdsUnicos("vendas", pacote.Banco.Vendas.Select(item => item.Id));
        ValidarIdsUnicos("ordensServico", pacote.Banco.OrdensServico.Select(item => item.Id));
        ValidarIdsUnicos("movimentosCaixa", pacote.Banco.MovimentosCaixa.Select(item => item.Id));

        var clientes = pacote.Banco.Clientes.Select(item => item.Id).ToHashSet();
        var vendedores = pacote.Banco.Vendedores.Select(item => item.Id).ToHashSet();
        var produtos = pacote.Banco.Produtos.Select(item => item.Id).ToHashSet();
        var servicos = pacote.Banco.Servicos.Select(item => item.Id).ToHashSet();

        foreach (var venda in pacote.Banco.Vendas)
        {
            if (!string.IsNullOrWhiteSpace(venda.VendedorId) && !vendedores.Contains(venda.VendedorId))
            {
                throw new RegraNegocioException($"Venda {venda.Id} referencia vendedor inexistente.");
            }

            foreach (var item in venda.Itens)
            {
                if (item.Tipo == TiposItemTransacional.Servico)
                {
                    if (string.IsNullOrWhiteSpace(item.ServicoId) || !servicos.Contains(item.ServicoId))
                    {
                        throw new RegraNegocioException($"Venda {venda.Id} referencia serviço inexistente.");
                    }
                }
                else if (string.IsNullOrWhiteSpace(item.ProdutoId) || !produtos.Contains(item.ProdutoId))
                {
                    throw new RegraNegocioException($"Venda {venda.Id} referencia produto inexistente.");
                }
            }
        }

        foreach (var ordem in pacote.Banco.OrdensServico)
        {
            ordem.Status = StatusOrdemServico.Normalizar(ordem.Status);

            if (!string.IsNullOrWhiteSpace(ordem.ClienteId) && !clientes.Contains(ordem.ClienteId))
            {
                throw new RegraNegocioException($"OS {ordem.Numero} referencia cliente inexistente.");
            }

            foreach (var item in ordem.Itens)
            {
                if (item.Tipo == TiposItemTransacional.Servico)
                {
                    if (string.IsNullOrWhiteSpace(item.ServicoId) || !servicos.Contains(item.ServicoId))
                    {
                        throw new RegraNegocioException($"OS {ordem.Numero} referencia serviço inexistente.");
                    }
                }
                else if (string.IsNullOrWhiteSpace(item.ProdutoId) || !produtos.Contains(item.ProdutoId))
                {
                    throw new RegraNegocioException($"OS {ordem.Numero} referencia produto inexistente.");
                }
            }
        }
    }

    private static void ValidarIdsUnicos(string entidade, IEnumerable<string> ids)
    {
        var vistos = new HashSet<string>();

        foreach (var id in ids)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new RegraNegocioException($"Backup contém {entidade} sem ID.");
            }

            if (!vistos.Add(id))
            {
                throw new RegraNegocioException($"Backup contém ID duplicado em {entidade}: {id}.");
            }
        }
    }

    private async Task<string?> SalvarBackupPreventivoAsync(CancellationToken cancelamento)
    {
        var temDados = await _contexto.Usuarios.AnyAsync(cancelamento)
            || await _contexto.Produtos.AnyAsync(cancelamento)
            || await _contexto.Clientes.AnyAsync(cancelamento)
            || await _contexto.Vendas.AnyAsync(cancelamento)
            || await _contexto.OrdensServico.AnyAsync(cancelamento);

        if (!temDados)
        {
            return null;
        }

        var (conteudo, nomeArquivo, _) = await CriarAsync(cancelamento);
        var pasta = Path.Combine(Path.GetTempPath(), "brinkpdv-preventive-backups");
        Directory.CreateDirectory(pasta);
        LimparBackupsPreventivosAntigos(pasta);
        var caminho = Path.Combine(pasta, nomeArquivo);
        await File.WriteAllBytesAsync(caminho, conteudo, cancelamento);
        return nomeArquivo;
    }

    private static void LimparBackupsPreventivosAntigos(string pasta)
    {
        foreach (var arquivo in Directory.EnumerateFiles(pasta, "*.brinkbackup"))
        {
            var info = new FileInfo(arquivo);
            if (info.CreationTimeUtc < DateTime.UtcNow.AddDays(-7))
            {
                info.Delete();
            }
        }
    }

    private async Task LimparBancoAsync(CancellationToken cancelamento)
    {
        _contexto.Vendas.RemoveRange(await _contexto.Vendas.ToListAsync(cancelamento));
        _contexto.OrdensServico.RemoveRange(await _contexto.OrdensServico.ToListAsync(cancelamento));
        _contexto.MovimentosCaixa.RemoveRange(await _contexto.MovimentosCaixa.ToListAsync(cancelamento));
        _contexto.Produtos.RemoveRange(await _contexto.Produtos.ToListAsync(cancelamento));
        _contexto.Servicos.RemoveRange(await _contexto.Servicos.ToListAsync(cancelamento));
        _contexto.Clientes.RemoveRange(await _contexto.Clientes.ToListAsync(cancelamento));
        _contexto.Vendedores.RemoveRange(await _contexto.Vendedores.ToListAsync(cancelamento));
        _contexto.ConfiguracoesLoja.RemoveRange(await _contexto.ConfiguracoesLoja.ToListAsync(cancelamento));
        _contexto.Usuarios.RemoveRange(await _contexto.Usuarios.ToListAsync(cancelamento));
        await _contexto.SaveChangesAsync(cancelamento);
    }

    private void RestaurarBanco(BackupBanco banco)
    {
        foreach (var cliente in banco.Clientes)
        {
            cliente.Ordens = [];
        }

        foreach (var venda in banco.Vendas)
        {
            venda.Vendedor = null;
            venda.Total = venda.CalcularTotal();
        }

        foreach (var ordem in banco.OrdensServico)
        {
            ordem.CadastroCliente = null;
            ordem.Status = StatusOrdemServico.Normalizar(ordem.Status);
            ordem.Valor = ordem.Itens.Count > 0 ? ordem.Itens.Sum(item => item.Total) : ordem.Valor;
        }

        _contexto.Usuarios.AddRange(banco.Usuarios);
        _contexto.ConfiguracoesLoja.AddRange(banco.ConfiguracoesLoja);
        _contexto.Clientes.AddRange(banco.Clientes);
        _contexto.Vendedores.AddRange(banco.Vendedores);
        _contexto.Produtos.AddRange(banco.Produtos);
        _contexto.Servicos.AddRange(banco.Servicos);
        _contexto.MovimentosCaixa.AddRange(banco.MovimentosCaixa);
        _contexto.OrdensServico.AddRange(banco.OrdensServico);
        _contexto.Vendas.AddRange(banco.Vendas);
    }

    private static string CriarNomeArquivo(string nomeLoja, DateTime data)
    {
        var loja = new string(nomeLoja
            .Select(caractere => char.IsLetterOrDigit(caractere) ? caractere : '_')
            .ToArray())
            .Trim('_');

        if (string.IsNullOrWhiteSpace(loja))
        {
            loja = "Loja";
        }

        return $"BRINKPDV_Backup_{loja}_{data:yyyy-MM-dd_HHmm}.brinkbackup";
    }

    private sealed record BackupPacote(ManifestBackupDto Manifest, BackupBanco Banco);

    private sealed class BackupBanco
    {
        public List<Usuario> Usuarios { get; set; } = [];
        public List<ConfiguracaoLoja> ConfiguracoesLoja { get; set; } = [];
        public List<Cliente> Clientes { get; set; } = [];
        public List<Vendedor> Vendedores { get; set; } = [];
        public List<string> Categorias { get; set; } = [];
        public List<Produto> Produtos { get; set; } = [];
        public List<Servico> Servicos { get; set; } = [];
        public List<Venda> Vendas { get; set; } = [];
        public List<OrdemServico> OrdensServico { get; set; } = [];
        public List<MovimentoCaixa> MovimentosCaixa { get; set; } = [];
    }
}
