using System.IO.Compression;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging.Abstractions;
using PDV.Dominio.Entidades;
using PDV.Dominio.Excecoes;
using PDV.Infraestrutura.Contexto;
using PDV.Repositorio;
using PDV.Servico.Dtos;
using PDV.Servico.Servicos;
using PDV.WebApi.Backup;

namespace PDV.Tests;

public class FluxosCriticosTestes
{
    [Fact]
    public async Task Categorias_ListamProdutosEPermitemRenomear()
    {
        await using var contexto = CriarContexto();
        var repositorio = new RepositorioProduto(contexto);
        var servico = new ServicoProduto(repositorio);

        await repositorio.CriarAsync(new Produto { Sku = "CAB-1", Nome = "Cabo USB-C 1m", Categoria = "CABOS", Preco = 20, Estoque = 2 });
        await repositorio.CriarAsync(new Produto { Sku = "CAB-2", Nome = "Cabo USB-C 2m", Categoria = "CABOS", Preco = 30, Estoque = 3 });
        await repositorio.CriarAsync(new Produto { Sku = "PEL-1", Nome = "Película", Categoria = "PELÍCULAS", Preco = 15, Estoque = 1 });

        var categorias = await servico.ListarCategoriasAsync();
        var cabos = categorias.Single(categoria => categoria.Nome == "CABOS");
        Assert.Equal(2, cabos.Quantidade);
        Assert.Equal(5, cabos.EstoqueTotal);

        var produtosCabos = await servico.ListarPorCategoriaAsync("cabos");
        Assert.Equal(2, produtosCabos.Count);

        var vazia = await servico.ListarPorCategoriaAsync("CARREGADORES");
        Assert.Empty(vazia);

        var atualizada = await servico.AtualizarCategoriaAsync("CABOS", new CategoriaAtualizacaoDto { Nome = "Cabos Premium" });
        Assert.Equal("Cabos Premium", atualizada.Nome);
        Assert.Equal(2, atualizada.Quantidade);
        Assert.Empty(await servico.ListarPorCategoriaAsync("CABOS"));
        Assert.Equal(2, (await servico.ListarPorCategoriaAsync("Cabos Premium")).Count);
    }

    [Fact]
    public async Task Servicos_AceitamPrecoPadraoOpcional()
    {
        await using var contexto = CriarContexto();
        var servico = new ServicoServico(new RepositorioServico(contexto));

        var semPreco = await servico.CriarAsync(new ServicoEntradaDto
        {
            Nome = "Diagnóstico",
            Descricao = "Avaliação inicial",
        });
        var comPreco = await servico.CriarAsync(new ServicoEntradaDto
        {
            Nome = "Troca de conector",
            PrecoPadrao = 50,
        });

        Assert.Null(semPreco.PrecoPadrao);
        Assert.Equal(50, comPreco.PrecoPadrao);
    }

    [Fact]
    public async Task Venda_DeServicoMantemValorHistoricoAposAlterarPrecoPadrao()
    {
        await using var contexto = CriarContexto();
        var repositorioServico = new RepositorioServico(contexto);
        var servicos = new ServicoServico(repositorioServico);
        var vendas = new ServicoVenda(
            new RepositorioVenda(contexto),
            new RepositorioProduto(contexto),
            repositorioServico,
            new RepositorioVendedor(contexto));

        var catalogo = await servicos.CriarAsync(new ServicoEntradaDto
        {
            Nome = "Troca de conector",
            PrecoPadrao = 50,
        });

        var venda = await vendas.RegistrarAsync(new VendaEntradaDto
        {
            FormaPagamento = FormasPagamento.Pix,
            Itens =
            [
                new ItemVendaEntradaDto
                {
                    Tipo = TiposItemTransacional.Servico,
                    ServicoId = catalogo.Id,
                    Quantidade = 1,
                    PrecoUnitario = 80,
                },
            ],
        });

        await servicos.AtualizarAsync(catalogo.Id, new ServicoEntradaDto
        {
            Nome = "Troca de conector",
            PrecoPadrao = 60,
            Ativo = true,
        });

        Assert.Equal(80, venda.Itens.Single().PrecoUnitario);
        Assert.Equal(80, venda.Total);
        Assert.Equal(60, (await servicos.ObterAsync(catalogo.Id))!.PrecoPadrao);
    }

    [Fact]
    public async Task OrdensServico_NormalizamEFiltramEmAndamento()
    {
        await using var contexto = CriarContexto();
        var clientes = new RepositorioCliente(contexto);
        var ordens = new ServicoOrdemServico(
            new RepositorioOrdemServico(contexto),
            clientes,
            new RepositorioProduto(contexto),
            new RepositorioServico(contexto));

        var cliente = await clientes.CriarAsync(new Cliente { Nome = "Cliente", Telefone = "11999999999" });
        var ordem = await ordens.CriarAsync(new OrdemServicoEntradaDto
        {
            ClienteId = cliente.Id,
            Marca = "Samsung",
            Modelo = "A10",
            Problema = "Não liga",
            Status = "em andamento",
            Valor = 120,
        });

        Assert.Equal(StatusOrdemServico.EmAndamento, ordem.Status);

        var emAndamento = await ordens.ListarAsync(status: StatusOrdemServico.EmAndamento);
        Assert.Single(emAndamento);

        await ordens.AtualizarAsync(ordem.Id, new OrdemServicoEntradaDto
        {
            ClienteId = cliente.Id,
            Cliente = cliente.Nome,
            ContatoCliente = cliente.Telefone,
            Marca = "Samsung",
            Modelo = "A10",
            Problema = "Não liga",
            Status = StatusOrdemServico.Entregue,
            Valor = 120,
        });

        Assert.Empty(await ordens.ListarAsync(status: StatusOrdemServico.EmAndamento));
        Assert.Single(await ordens.ListarAsync(status: StatusOrdemServico.Entregue));
    }

    [Fact]
    public async Task Backup_GeraManifestComEntidadesEOrdensServico()
    {
        await using var contexto = CriarContexto();
        await SemearBackupAsync(contexto);
        var servico = new ServicoBackup(contexto, NullLogger<ServicoBackup>.Instance);

        var (conteudo, nomeArquivo, manifest) = await servico.CriarAsync();

        Assert.EndsWith(".brinkbackup", nomeArquivo);
        Assert.Equal(ServicoBackup.Formato, manifest.Format);
        Assert.Equal(1, manifest.Records["ordensServico"]);
        Assert.Equal(1, manifest.Records["servicos"]);

        using var zip = new ZipArchive(new MemoryStream(conteudo), ZipArchiveMode.Read);
        Assert.NotNull(zip.GetEntry("manifest.json"));
        Assert.NotNull(zip.GetEntry("database/ordens_servico.json"));
        Assert.NotNull(zip.GetEntry("database/servicos.json"));
    }

    [Fact]
    public async Task Backup_RejeitaArquivoInvalidoEIncompativel()
    {
        await using var contexto = CriarContexto();
        var servico = new ServicoBackup(contexto, NullLogger<ServicoBackup>.Instance);

        await Assert.ThrowsAsync<RegraNegocioException>(() =>
            servico.ValidarAsync(new MemoryStream([1, 2, 3]), "backup.txt"));

        var (conteudo, _, _) = await servico.CriarAsync();
        using var memoria = new MemoryStream();
        using (var destino = new ZipArchive(memoria, ZipArchiveMode.Create, leaveOpen: true))
        using (var origem = new ZipArchive(new MemoryStream(conteudo), ZipArchiveMode.Read))
        {
            foreach (var entrada in origem.Entries.Where(item => item.FullName != "manifest.json"))
            {
                var nova = destino.CreateEntry(entrada.FullName);
                await using var entradaStream = entrada.Open();
                await using var novaStream = nova.Open();
                await entradaStream.CopyToAsync(novaStream);
            }

            var manifest = destino.CreateEntry("manifest.json");
            await using var stream = manifest.Open();
            await JsonSerializer.SerializeAsync(stream, new
            {
                format = ServicoBackup.Formato,
                version = 999,
                createdAt = DateTime.UtcNow,
                applicationVersion = "1.0.0",
                storeId = (string?)null,
                storeName = "BRINKPDV",
                records = new Dictionary<string, int>(),
            });
        }

        await Assert.ThrowsAsync<RegraNegocioException>(() =>
            servico.ValidarAsync(new MemoryStream(memoria.ToArray()), "backup.brinkbackup"));
    }

    [Fact]
    public async Task Restore_RestauraDadosPreservandoRelacionamentos()
    {
        await using var origem = CriarContexto();
        await SemearBackupAsync(origem);
        var backupOrigem = new ServicoBackup(origem, NullLogger<ServicoBackup>.Instance);
        var (conteudo, nomeArquivo, _) = await backupOrigem.CriarAsync();

        await using var destino = CriarContexto();
        destino.Produtos.Add(new Produto { Sku = "TEMP", Nome = "Temporário", Categoria = "Teste", Preco = 1, Estoque = 1 });
        await destino.SaveChangesAsync();

        var backupDestino = new ServicoBackup(destino, NullLogger<ServicoBackup>.Instance);
        var resultado = await backupDestino.RestaurarAsync(new MemoryStream(conteudo), nomeArquivo);

        Assert.NotNull(resultado.PreventiveBackupFileName);
        Assert.Equal("Loja Teste", resultado.Manifest.StoreName);
        Assert.DoesNotContain(destino.Produtos, produto => produto.Sku == "TEMP");
        Assert.Single(destino.OrdensServico);
        Assert.Single(destino.Vendas);
        Assert.Equal(destino.Clientes.Single().Id, destino.OrdensServico.Single().ClienteId);
        Assert.Equal(destino.Servicos.Single().Id, destino.OrdensServico.Single().Itens.Single().ServicoId);
    }

    private static PdvDbContext CriarContexto()
    {
        var opcoes = new DbContextOptionsBuilder<PdvDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(configuracao => configuracao.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        return new PdvDbContext(opcoes);
    }

    private static async Task SemearBackupAsync(PdvDbContext contexto)
    {
        var cliente = new Cliente { Nome = "Maria", Telefone = "11988887777" };
        var vendedor = new Vendedor { Nome = "João", Email = "joao@loja.test", Telefone = "11977776666" };
        var produto = new Produto { Sku = "CAB-1", Nome = "Cabo USB-C", Categoria = "CABOS", Preco = 25, Estoque = 10 };
        var servico = new PDV.Dominio.Entidades.Servico { Nome = "Troca de conector", PrecoPadrao = 50 };

        contexto.ConfiguracoesLoja.Add(new ConfiguracaoLoja { NomeLoja = "Loja Teste" });
        contexto.Usuarios.Add(new Usuario { NomeUsuario = "admin", SenhaHash = "hash", Funcao = FuncoesUsuario.Administrador });
        contexto.Clientes.Add(cliente);
        contexto.Vendedores.Add(vendedor);
        contexto.Produtos.Add(produto);
        contexto.Servicos.Add(servico);
        contexto.MovimentosCaixa.Add(new MovimentoCaixa { Tipo = TiposMovimentoCaixa.Entrada, Valor = 100, Descricao = "Abertura" });
        contexto.OrdensServico.Add(new OrdemServico
        {
            Numero = "OS-0001",
            ClienteId = cliente.Id,
            Cliente = cliente.Nome,
            ContatoCliente = cliente.Telefone,
            Marca = "Samsung",
            Modelo = "A10",
            Aparelho = "Samsung A10",
            Problema = "Não liga",
            Status = StatusOrdemServico.EmAndamento,
            Valor = 80,
            Itens =
            [
                new ItemOrdemServico
                {
                    ServicoId = servico.Id,
                    Tipo = TiposItemTransacional.Servico,
                    Nome = servico.Nome,
                    Quantidade = 1,
                    PrecoUnitario = 80,
                },
            ],
        });
        contexto.Vendas.Add(new Venda
        {
            VendedorId = vendedor.Id,
            FormaPagamento = FormasPagamento.Pix,
            Itens =
            [
                new ItemVenda
                {
                    ProdutoId = produto.Id,
                    Tipo = TiposItemTransacional.Produto,
                    Nome = produto.Nome,
                    Quantidade = 1,
                    PrecoUnitario = 25,
                },
            ],
            Total = 25,
        });

        await contexto.SaveChangesAsync();
    }
}