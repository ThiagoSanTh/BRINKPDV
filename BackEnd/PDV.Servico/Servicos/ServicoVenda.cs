using PDV.Dominio.Entidades;
using PDV.Dominio.Excecoes;
using PDV.Dominio.Repositorios;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;
using PDV.Servico.Mapeamentos;

namespace PDV.Servico.Servicos;

public class ServicoVenda : IServicoVenda
{
    private readonly IRepositorioVenda _repositorioVenda;
    private readonly IRepositorioProduto _repositorioProduto;
    private readonly IRepositorioServico _repositorioServico;
    private readonly IRepositorioVendedor _repositorioVendedor;

    public ServicoVenda(
        IRepositorioVenda repositorioVenda,
        IRepositorioProduto repositorioProduto,
        IRepositorioServico repositorioServico,
        IRepositorioVendedor repositorioVendedor)
    {
        _repositorioVenda = repositorioVenda;
        _repositorioProduto = repositorioProduto;
        _repositorioServico = repositorioServico;
        _repositorioVendedor = repositorioVendedor;
    }

    public async Task<IReadOnlyList<VendaDto>> ListarAsync(CancellationToken cancelamento = default)
    {
        var vendas = await _repositorioVenda.ObterTodasAsync(cancelamento);
        return vendas.Select(venda => venda.ParaDto()).ToList();
    }

    public async Task<IReadOnlyList<VendaDto>> ListarDeHojeAsync(CancellationToken cancelamento = default)
    {
        var vendas = await _repositorioVenda.ObterDeHojeAsync(cancelamento);
        return vendas.Select(venda => venda.ParaDto()).ToList();
    }

    public async Task<IReadOnlyList<VendaDto>> ListarPorPeriodoAsync(DateOnly inicio, DateOnly fim, CancellationToken cancelamento = default)
    {
        var inicioUtc = inicio.ToDateTime(TimeOnly.MinValue);
        var fimUtc = fim.AddDays(1).ToDateTime(TimeOnly.MinValue);

        var vendas = await _repositorioVenda.ObterPorPeriodoAsync(inicioUtc, fimUtc, cancelamento);
        return vendas.Select(venda => venda.ParaDto()).ToList();
    }

    public async Task<VendaDto?> ObterAsync(string id, CancellationToken cancelamento = default)
    {
        var venda = await _repositorioVenda.ObterPorIdAsync(id, cancelamento);
        return venda?.ParaDto();
    }

    public async Task<VendaDto> RegistrarAsync(VendaEntradaDto entrada, CancellationToken cancelamento = default)
    {
        if (entrada.Itens.Count == 0)
        {
            throw new RegraNegocioException("A venda precisa de pelo menos um item.");
        }

        if (!FormasPagamento.EhValida(entrada.FormaPagamento))
        {
            throw new RegraNegocioException($"Forma de pagamento inválida: {entrada.FormaPagamento}.");
        }

        var itens = new List<ItemVenda>();
        var produtos = new List<(Produto Produto, int Quantidade)>();

        foreach (var itemEntrada in entrada.Itens)
        {
            var tipo = string.IsNullOrWhiteSpace(itemEntrada.Tipo)
                ? TiposItemTransacional.Produto
                : itemEntrada.Tipo.Trim().ToLower();

            if (!TiposItemTransacional.EhValido(tipo))
            {
                throw new RegraNegocioException($"Tipo de item inválido: {itemEntrada.Tipo}.");
            }

            if (itemEntrada.Quantidade <= 0)
            {
                throw new RegraNegocioException("A quantidade de cada item deve ser maior que zero.");
            }

            if (tipo == TiposItemTransacional.Servico)
            {
                if (string.IsNullOrWhiteSpace(itemEntrada.ServicoId))
                {
                    throw new RegraNegocioException("Informe o serviço do item.");
                }

                var servico = await _repositorioServico.ObterPorIdAsync(itemEntrada.ServicoId, cancelamento)
                    ?? throw new RecursoNaoEncontradoException($"Serviço {itemEntrada.ServicoId} não encontrado.");

                var precoServico = itemEntrada.PrecoUnitario ?? servico.PrecoPadrao;

                if (precoServico is null or <= 0)
                {
                    throw new RegraNegocioException($"Informe o valor cobrado para {servico.Nome}.");
                }

                var descontoServico = Math.Max(0, itemEntrada.Desconto);

                if (descontoServico > precoServico.Value * itemEntrada.Quantidade)
                {
                    throw new RegraNegocioException($"O desconto de {servico.Nome} é maior que o valor do item.");
                }

                itens.Add(new ItemVenda
                {
                    ProdutoId = string.Empty,
                    ServicoId = servico.Id,
                    Tipo = TiposItemTransacional.Servico,
                    Nome = servico.Nome,
                    Quantidade = itemEntrada.Quantidade,
                    PrecoUnitario = precoServico.Value,
                    Desconto = descontoServico,
                });

                continue;
            }

            if (string.IsNullOrWhiteSpace(itemEntrada.ProdutoId))
            {
                throw new RegraNegocioException("Informe o produto do item.");
            }

            var produto = await _repositorioProduto.ObterPorIdAsync(itemEntrada.ProdutoId, cancelamento)
                ?? throw new RecursoNaoEncontradoException($"Produto {itemEntrada.ProdutoId} não encontrado.");

            if (produto.Estoque < itemEntrada.Quantidade)
            {
                throw new RegraNegocioException(
                    $"Estoque insuficiente para {produto.Nome}. Disponível: {produto.Estoque}.");
            }

            var precoUnitario = itemEntrada.PrecoUnitario ?? produto.Preco;

            if (precoUnitario <= 0)
            {
                throw new RegraNegocioException($"O preço de {produto.Nome} deve ser maior que zero.");
            }

            var desconto = Math.Max(0, itemEntrada.Desconto);

            if (desconto > precoUnitario * itemEntrada.Quantidade)
            {
                throw new RegraNegocioException($"O desconto de {produto.Nome} é maior que o valor do item.");
            }

            itens.Add(new ItemVenda
            {
                ProdutoId = produto.Id,
                Tipo = TiposItemTransacional.Produto,
                Nome = produto.Nome,
                Quantidade = itemEntrada.Quantidade,
                PrecoUnitario = precoUnitario,
                Desconto = desconto,
            });

            produtos.Add((produto, itemEntrada.Quantidade));
        }

        Vendedor? vendedor = null;

        if (!string.IsNullOrWhiteSpace(entrada.VendedorId))
        {
            vendedor = await _repositorioVendedor.ObterPorIdAsync(entrada.VendedorId, cancelamento);
        }

        var venda = new Venda
        {
            VendedorId = vendedor?.Id,
            FormaPagamento = entrada.FormaPagamento,
            Observacao = string.IsNullOrWhiteSpace(entrada.Observacao) ? null : entrada.Observacao.Trim(),
            Itens = itens,
            CriadoEm = DateTime.UtcNow,
        };

        venda.Total = venda.CalcularTotal();

        var criada = await _repositorioVenda.CriarAsync(venda, cancelamento);

        foreach (var (produto, quantidade) in produtos)
        {
            produto.Estoque -= quantidade;
            await _repositorioProduto.AtualizarAsync(produto, cancelamento);
        }

        if (vendedor is not null)
        {
            vendedor.TotalVendas += criada.Total;
            await _repositorioVendedor.AtualizarAsync(vendedor, cancelamento);
        }

        criada.Vendedor = vendedor;
        return criada.ParaDto();
    }
}
