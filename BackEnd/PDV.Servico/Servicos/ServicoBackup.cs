using System.IO.Compression;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using PDV.Dominio.Entidades;
using PDV.Dominio.Excecoes;
using PDV.Infraestrutura.Contexto;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;

namespace PDV.Servico.Servicos;

public class ServicoBackup : IServicoBackup
{
    public const string Formato = "BRINKPDV_BACKUP";
    public const int Versao = 1;

    private static readonly JsonSerializerOptions OpcoesJson = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        WriteIndented = true,
    };

    private readonly PdvDbContext _contexto;

    public ServicoBackup(PdvDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<(byte[] Arquivo, string NomeArquivo)> CriarAsync(CancellationToken cancelamento = default)
    {
        var conteudo = await MontarArquivoAsync(cancelamento);
        var nome = $"brinkpdv-backup-{DateTime.UtcNow:yyyyMMdd-HHmmss}.brinkbackup";
        return (conteudo, nome);
    }

    public async Task<BackupResumoDto> ValidarAsync(Stream arquivo, CancellationToken cancelamento = default)
    {
        var pacote = await LerPacoteAsync(arquivo, cancelamento);
        return CriarResumo(pacote.Manifest, pacote.Entidades, validacao: true);
    }

    public async Task<RestaurarBackupResultadoDto> RestaurarAsync(Stream arquivo, CancellationToken cancelamento = default)
    {
        var pacote = await LerPacoteAsync(arquivo, cancelamento);
        var resumo = CriarResumo(pacote.Manifest, pacote.Entidades, validacao: true);

        if (!resumo.Compativel)
        {
            throw new RegraNegocioException(resumo.Mensagem ?? "Backup incompatível.");
        }

        var backupPreventivo = await MontarArquivoAsync(cancelamento);

        await using var transacao = await _contexto.Database.BeginTransactionAsync(cancelamento);

        try
        {
            await LimparDadosAsync(cancelamento);
            await InserirDadosAsync(pacote.Entidades, cancelamento);
            await _contexto.SaveChangesAsync(cancelamento);
            await transacao.CommitAsync(cancelamento);

            return new RestaurarBackupResultadoDto(
                true,
                "Backup restaurado com sucesso.",
                resumo.Records,
                Convert.ToBase64String(backupPreventivo));
        }
        catch (Exception excecao)
        {
            await transacao.RollbackAsync(cancelamento);
            throw new RegraNegocioException($"Falha ao restaurar backup: {excecao.Message}");
        }
    }

    private async Task<byte[]> MontarArquivoAsync(CancellationToken cancelamento)
    {
        var entidades = await ExportarEntidadesAsync(cancelamento);
        var configuracao = await _contexto.ConfiguracoesLoja.AsNoTracking().FirstOrDefaultAsync(cancelamento);

        var manifest = new BackupManifesto
        {
            Format = Formato,
            Version = Versao,
            CreatedAt = DateTime.UtcNow,
            StoreName = configuracao?.NomeLoja,
            Records = new Dictionary<string, int>
            {
                ["produtos"] = entidades.Produtos.Count,
                ["vendas"] = entidades.Vendas.Count,
                ["vendedores"] = entidades.Vendedores.Count,
                ["clientes"] = entidades.Clientes.Count,
                ["ordens_servico"] = entidades.OrdensServico.Count,
                ["servicos"] = entidades.Servicos.Count,
                ["usuarios"] = entidades.Usuarios.Count,
                ["configuracao_loja"] = entidades.ConfiguracaoLoja.Count,
                ["movimentos_caixa"] = entidades.MovimentosCaixa.Count,
            },
        };

        using var memoria = new MemoryStream();
        using (var zip = new ZipArchive(memoria, ZipArchiveMode.Create, leaveOpen: true))
        {
            AdicionarEntrada(zip, "manifest.json", JsonSerializer.Serialize(manifest, OpcoesJson));
            AdicionarEntrada(zip, "produtos.json", JsonSerializer.Serialize(entidades.Produtos, OpcoesJson));
            AdicionarEntrada(zip, "vendas.json", JsonSerializer.Serialize(entidades.Vendas, OpcoesJson));
            AdicionarEntrada(zip, "vendedores.json", JsonSerializer.Serialize(entidades.Vendedores, OpcoesJson));
            AdicionarEntrada(zip, "clientes.json", JsonSerializer.Serialize(entidades.Clientes, OpcoesJson));
            AdicionarEntrada(zip, "ordens_servico.json", JsonSerializer.Serialize(entidades.OrdensServico, OpcoesJson));
            AdicionarEntrada(zip, "servicos.json", JsonSerializer.Serialize(entidades.Servicos, OpcoesJson));
            AdicionarEntrada(zip, "usuarios.json", JsonSerializer.Serialize(entidades.Usuarios, OpcoesJson));
            AdicionarEntrada(zip, "configuracao_loja.json", JsonSerializer.Serialize(entidades.ConfiguracaoLoja, OpcoesJson));
            AdicionarEntrada(zip, "movimentos_caixa.json", JsonSerializer.Serialize(entidades.MovimentosCaixa, OpcoesJson));
        }

        return memoria.ToArray();
    }

    private async Task<BackupPacote> LerPacoteAsync(Stream arquivo, CancellationToken cancelamento)
    {
        using var memoria = new MemoryStream();
        await arquivo.CopyToAsync(memoria, cancelamento);
        memoria.Position = 0;

        using var zip = new ZipArchive(memoria, ZipArchiveMode.Read);

        var manifestoEntrada = zip.GetEntry("manifest.json")
            ?? throw new RegraNegocioException("Arquivo de backup inválido: manifest.json não encontrado.");

        BackupManifesto manifest;
        await using (var leitor = manifestoEntrada.Open())
        {
            manifest = await JsonSerializer.DeserializeAsync<BackupManifesto>(leitor, OpcoesJson, cancellationToken: cancelamento)
                ?? throw new RegraNegocioException("Manifesto do backup inválido.");
        }

        var entidades = new BackupEntidades
        {
            Produtos = await LerListaAsync<Produto>(zip, "produtos.json", cancelamento),
            Vendas = await LerListaAsync<Venda>(zip, "vendas.json", cancelamento),
            Vendedores = await LerListaAsync<Vendedor>(zip, "vendedores.json", cancelamento),
            Clientes = await LerListaAsync<Cliente>(zip, "clientes.json", cancelamento),
            OrdensServico = await LerListaAsync<OrdemServico>(zip, "ordens_servico.json", cancelamento),
            Servicos = await LerListaAsync<ServicoCatalogo>(zip, "servicos.json", cancelamento),
            Usuarios = await LerListaAsync<Usuario>(zip, "usuarios.json", cancelamento),
            ConfiguracaoLoja = await LerListaAsync<ConfiguracaoLoja>(zip, "configuracao_loja.json", cancelamento),
            MovimentosCaixa = await LerListaAsync<MovimentoCaixa>(zip, "movimentos_caixa.json", cancelamento),
        };

        return new BackupPacote(manifest, entidades);
    }

    private static async Task<List<T>> LerListaAsync<T>(ZipArchive zip, string nomeArquivo, CancellationToken cancelamento)
    {
        var entrada = zip.GetEntry(nomeArquivo);

        if (entrada is null)
        {
            return [];
        }

        await using var leitor = entrada.Open();
        return await JsonSerializer.DeserializeAsync<List<T>>(leitor, OpcoesJson, cancellationToken: cancelamento) ?? [];
    }

    private async Task<BackupEntidades> ExportarEntidadesAsync(CancellationToken cancelamento)
    {
        return new BackupEntidades
        {
            Produtos = await _contexto.Produtos.AsNoTracking().ToListAsync(cancelamento),
            Vendas = await _contexto.Vendas.AsNoTracking().ToListAsync(cancelamento),
            Vendedores = await _contexto.Vendedores.AsNoTracking().ToListAsync(cancelamento),
            Clientes = await _contexto.Clientes.AsNoTracking().ToListAsync(cancelamento),
            OrdensServico = await _contexto.OrdensServico.AsNoTracking().ToListAsync(cancelamento),
            Servicos = await _contexto.Servicos.AsNoTracking().ToListAsync(cancelamento),
            Usuarios = await _contexto.Usuarios.AsNoTracking().ToListAsync(cancelamento),
            ConfiguracaoLoja = await _contexto.ConfiguracoesLoja.AsNoTracking().ToListAsync(cancelamento),
            MovimentosCaixa = await _contexto.MovimentosCaixa.AsNoTracking().ToListAsync(cancelamento),
        };
    }

    private static BackupResumoDto CriarResumo(BackupManifesto manifest, BackupEntidades entidades, bool validacao)
    {
        var compativel = manifest.Format == Formato && manifest.Version <= Versao;
        string? mensagem = null;

        if (manifest.Format != Formato)
        {
            mensagem = "Formato de backup não reconhecido.";
            compativel = false;
        }
        else if (manifest.Version > Versao)
        {
            mensagem = $"Versão do backup ({manifest.Version}) é mais recente que a suportada ({Versao}).";
            compativel = false;
        }
        else if (validacao)
        {
            mensagem = compativel ? "Backup válido e compatível." : "Backup incompatível.";
        }

        var records = manifest.Records ?? new Dictionary<string, int>
        {
            ["produtos"] = entidades.Produtos.Count,
            ["vendas"] = entidades.Vendas.Count,
            ["vendedores"] = entidades.Vendedores.Count,
            ["clientes"] = entidades.Clientes.Count,
            ["ordens_servico"] = entidades.OrdensServico.Count,
            ["servicos"] = entidades.Servicos.Count,
            ["usuarios"] = entidades.Usuarios.Count,
            ["configuracao_loja"] = entidades.ConfiguracaoLoja.Count,
            ["movimentos_caixa"] = entidades.MovimentosCaixa.Count,
        };

        return new BackupResumoDto(
            manifest.Format,
            manifest.Version,
            manifest.CreatedAt,
            manifest.StoreName,
            records,
            compativel,
            mensagem);
    }

    private async Task LimparDadosAsync(CancellationToken cancelamento)
    {
        await _contexto.MovimentosCaixa.ExecuteDeleteAsync(cancelamento);
        await _contexto.Vendas.ExecuteDeleteAsync(cancelamento);
        await _contexto.OrdensServico.ExecuteDeleteAsync(cancelamento);
        await _contexto.Clientes.ExecuteDeleteAsync(cancelamento);
        await _contexto.Produtos.ExecuteDeleteAsync(cancelamento);
        await _contexto.Vendedores.ExecuteDeleteAsync(cancelamento);
        await _contexto.Servicos.ExecuteDeleteAsync(cancelamento);
        await _contexto.Usuarios.ExecuteDeleteAsync(cancelamento);
        await _contexto.ConfiguracoesLoja.ExecuteDeleteAsync(cancelamento);
    }

    private async Task InserirDadosAsync(BackupEntidades entidades, CancellationToken cancelamento)
    {
        if (entidades.ConfiguracaoLoja.Count > 0)
        {
            await _contexto.ConfiguracoesLoja.AddRangeAsync(entidades.ConfiguracaoLoja, cancelamento);
        }

        if (entidades.Usuarios.Count > 0)
        {
            await _contexto.Usuarios.AddRangeAsync(entidades.Usuarios, cancelamento);
        }

        if (entidades.Vendedores.Count > 0)
        {
            await _contexto.Vendedores.AddRangeAsync(entidades.Vendedores, cancelamento);
        }

        if (entidades.Clientes.Count > 0)
        {
            await _contexto.Clientes.AddRangeAsync(entidades.Clientes, cancelamento);
        }

        if (entidades.Produtos.Count > 0)
        {
            await _contexto.Produtos.AddRangeAsync(entidades.Produtos, cancelamento);
        }

        if (entidades.Servicos.Count > 0)
        {
            await _contexto.Servicos.AddRangeAsync(entidades.Servicos, cancelamento);
        }

        if (entidades.OrdensServico.Count > 0)
        {
            foreach (var ordem in entidades.OrdensServico)
            {
                ordem.CadastroCliente = null;
            }

            await _contexto.OrdensServico.AddRangeAsync(entidades.OrdensServico, cancelamento);
        }

        if (entidades.Vendas.Count > 0)
        {
            foreach (var venda in entidades.Vendas)
            {
                venda.Vendedor = null;
            }

            await _contexto.Vendas.AddRangeAsync(entidades.Vendas, cancelamento);
        }

        if (entidades.MovimentosCaixa.Count > 0)
        {
            await _contexto.MovimentosCaixa.AddRangeAsync(entidades.MovimentosCaixa, cancelamento);
        }
    }

    private static void AdicionarEntrada(ZipArchive zip, string nome, string conteudo)
    {
        var entrada = zip.CreateEntry(nome, CompressionLevel.Optimal);
        using var escritor = new StreamWriter(entrada.Open(), Encoding.UTF8);
        escritor.Write(conteudo);
    }

    private sealed class BackupManifesto
    {
        public string Format { get; set; } = string.Empty;
        public int Version { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? StoreName { get; set; }
        public Dictionary<string, int>? Records { get; set; }
    }

    private sealed class BackupEntidades
    {
        public List<Produto> Produtos { get; set; } = [];
        public List<Venda> Vendas { get; set; } = [];
        public List<Vendedor> Vendedores { get; set; } = [];
        public List<Cliente> Clientes { get; set; } = [];
        public List<OrdemServico> OrdensServico { get; set; } = [];
        public List<ServicoCatalogo> Servicos { get; set; } = [];
        public List<Usuario> Usuarios { get; set; } = [];
        public List<ConfiguracaoLoja> ConfiguracaoLoja { get; set; } = [];
        public List<MovimentoCaixa> MovimentosCaixa { get; set; } = [];
    }

    private sealed record BackupPacote(BackupManifesto Manifest, BackupEntidades Entidades);
}
