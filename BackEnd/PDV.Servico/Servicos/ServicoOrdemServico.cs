using PDV.Dominio.Entidades;
using PDV.Dominio.Excecoes;
using PDV.Dominio.Repositorios;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;
using PDV.Servico.Mapeamentos;

namespace PDV.Servico.Servicos;

public class ServicoOrdemServico : IServicoOrdemServico
{
    private readonly IRepositorioOrdemServico _repositorio;
    private readonly IRepositorioCliente _repositorioCliente;
    private readonly IRepositorioProduto _repositorioProduto;
    private readonly IRepositorioServico _repositorioServico;

    public ServicoOrdemServico(
        IRepositorioOrdemServico repositorio,
        IRepositorioCliente repositorioCliente,
        IRepositorioProduto repositorioProduto,
        IRepositorioServico repositorioServico)
    {
        _repositorio = repositorio;
        _repositorioCliente = repositorioCliente;
        _repositorioProduto = repositorioProduto;
        _repositorioServico = repositorioServico;
    }

    public async Task<IReadOnlyList<OrdemServicoDto>> ListarAsync(
        string? busca = null,
        string? status = null,
        string? clienteId = null,
        CancellationToken cancelamento = default)
    {
        var ordens = await _repositorio.ObterTodasAsync(busca, status, clienteId, cancelamento);
        return ordens.Select(ordem => ordem.ParaDto()).ToList();
    }

    public async Task<IReadOnlyList<OrdemServicoDto>> ListarPorClienteAsync(
        string clienteId,
        CancellationToken cancelamento = default)
    {
        var ordens = await _repositorio.ObterPorClienteAsync(clienteId, cancelamento);
        return ordens.Select(ordem => ordem.ParaDto()).ToList();
    }

    public async Task<OrdemServicoDto?> ObterAsync(string id, CancellationToken cancelamento = default)
    {
        var ordem = await _repositorio.ObterPorIdAsync(id, cancelamento);
        return ordem?.ParaDto();
    }

    public async Task<OrdemServicoDto> CriarAsync(OrdemServicoEntradaDto entrada, CancellationToken cancelamento = default)
    {
        var cliente = await ResolverClienteAsync(entrada, cancelamento);
        Validar(entrada);

        var total = await _repositorio.ContarAsync(cancelamento);
        var hoje = DateOnly.FromDateTime(DateTime.Today);
        var status = StatusOrdemServico.Normalizar(entrada.Status);
        var marca = (entrada.Marca ?? string.Empty).Trim();
        var modelo = (entrada.Modelo ?? string.Empty).Trim();
        var tipo = string.IsNullOrWhiteSpace(entrada.TipoAparelho) ? TiposAparelho.Outro : entrada.TipoAparelho.Trim();
        var itens = await ResolverItensAsync(entrada.Itens ?? [], cancelamento);
        var aparelho = string.IsNullOrWhiteSpace(entrada.Aparelho)
            ? $"{marca} {modelo}".Trim()
            : entrada.Aparelho.Trim();

        var ordem = new OrdemServico
        {
            Numero = $"OS-{total + 1:D4}",
            ClienteId = cliente.Id,
            Cliente = cliente.Nome,
            ContatoCliente = cliente.Telefone,
            TipoAparelho = tipo,
            Marca = marca,
            Modelo = modelo,
            Aparelho = string.IsNullOrWhiteSpace(aparelho) ? tipo : aparelho,
            EstadoAparelho = string.IsNullOrWhiteSpace(entrada.EstadoAparelho)
                ? EstadosAparelho.Bom
                : entrada.EstadoAparelho.Trim(),
            Problema = entrada.Problema!.Trim(),
            Status = status,
            Prioridade = entrada.Prioridade ?? PrioridadesOrdemServico.Media,
            Valor = itens.Count > 0 ? itens.Sum(item => item.Total) : entrada.Valor,
            Itens = itens,
            Data = hoje,
            Prazo = entrada.Prazo ?? hoje.AddDays(7),
            DataSaida = StatusOrdemServico.EstaEncerrada(status)
                ? entrada.DataSaida ?? hoje
                : entrada.DataSaida,
        };

        var criada = await _repositorio.CriarAsync(ordem, cancelamento);
        return criada.ParaDto();
    }

    public async Task<OrdemServicoDto?> AtualizarAsync(
        string id,
        OrdemServicoEntradaDto entrada,
        CancellationToken cancelamento = default)
    {
        Validar(entrada, atualizacao: true);

        var existente = await _repositorio.ObterPorIdAsync(id, cancelamento);

        if (existente is null)
        {
            return null;
        }

        var cliente = await ResolverClienteAsync(entrada, cancelamento, existente);
        var status = StatusOrdemServico.Normalizar(entrada.Status ?? existente.Status);
        var marca = string.IsNullOrWhiteSpace(entrada.Marca) ? existente.Marca : entrada.Marca.Trim();
        var modelo = string.IsNullOrWhiteSpace(entrada.Modelo) ? existente.Modelo : entrada.Modelo.Trim();
        var tipo = string.IsNullOrWhiteSpace(entrada.TipoAparelho) ? existente.TipoAparelho : entrada.TipoAparelho.Trim();
        var itens = entrada.Itens is null
            ? existente.Itens
            : await ResolverItensAsync(entrada.Itens, cancelamento);
        var aparelho = string.IsNullOrWhiteSpace(entrada.Aparelho)
            ? $"{marca} {modelo}".Trim()
            : entrada.Aparelho.Trim();

        existente.ClienteId = cliente.Id;
        existente.Cliente = cliente.Nome;
        existente.ContatoCliente = cliente.Telefone;
        existente.TipoAparelho = tipo;
        existente.Marca = marca;
        existente.Modelo = modelo;
        existente.Aparelho = string.IsNullOrWhiteSpace(aparelho) ? tipo : aparelho;
        existente.EstadoAparelho = string.IsNullOrWhiteSpace(entrada.EstadoAparelho)
            ? existente.EstadoAparelho
            : entrada.EstadoAparelho.Trim();
        existente.Problema = string.IsNullOrWhiteSpace(entrada.Problema) ? existente.Problema : entrada.Problema.Trim();
        existente.Status = status;
        existente.Prioridade = entrada.Prioridade ?? existente.Prioridade;
        existente.Itens = itens;
        existente.Valor = itens.Count > 0 ? itens.Sum(item => item.Total) : entrada.Valor;
        existente.Prazo = entrada.Prazo ?? existente.Prazo;
        existente.DataSaida = status == StatusOrdemServico.Entregue
            ? entrada.DataSaida ?? existente.DataSaida ?? DateOnly.FromDateTime(DateTime.Today)
            : entrada.DataSaida;

        var atualizada = await _repositorio.AtualizarAsync(existente, cancelamento);
        return atualizada?.ParaDto();
    }

    public async Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default)
    {
        return await _repositorio.RemoverAsync(id, cancelamento);
    }

    private async Task<Cliente> ResolverClienteAsync(
        OrdemServicoEntradaDto entrada,
        CancellationToken cancelamento,
        OrdemServico? existente = null)
    {
        var nome = (entrada.Cliente ?? existente?.Cliente ?? string.Empty).Trim();
        var telefone = TelefoneCliente.SomenteDigitos(entrada.ContatoCliente ?? existente?.ContatoCliente);
        var temDadosCliente = !string.IsNullOrWhiteSpace(entrada.Cliente)
            || !string.IsNullOrWhiteSpace(entrada.ContatoCliente);

        if (temDadosCliente)
        {
            if (string.IsNullOrWhiteSpace(nome) || !TelefoneCliente.EhValido(telefone))
            {
                throw new RegraNegocioException("Informe o cliente da ordem de serviço com um telefone válido.");
            }

            var porTelefone = await _repositorioCliente.ObterPorTelefoneAsync(telefone, cancelamento);
            if (porTelefone is not null)
            {
                if (!string.Equals(porTelefone.Nome, nome, StringComparison.OrdinalIgnoreCase))
                {
                    porTelefone.Nome = nome;
                    await _repositorioCliente.AtualizarAsync(porTelefone, cancelamento);
                }

                return porTelefone;
            }

            var vinculadoId = !string.IsNullOrWhiteSpace(entrada.ClienteId)
                ? entrada.ClienteId
                : existente?.ClienteId;

            if (!string.IsNullOrWhiteSpace(vinculadoId))
            {
                var vinculado = await _repositorioCliente.ObterPorIdAsync(vinculadoId, cancelamento);
                if (vinculado is not null)
                {
                    vinculado.Nome = nome;
                    vinculado.Telefone = telefone;
                    await _repositorioCliente.AtualizarAsync(vinculado, cancelamento);
                    return vinculado;
                }
            }

            return await _repositorioCliente.CriarAsync(
                new Cliente
                {
                    Nome = nome,
                    Telefone = telefone,
                },
                cancelamento);
        }

        if (!string.IsNullOrWhiteSpace(entrada.ClienteId))
        {
            var cadastrado = await _repositorioCliente.ObterPorIdAsync(entrada.ClienteId, cancelamento);
            if (cadastrado is null)
            {
                throw new RecursoNaoEncontradoException("Cliente não encontrado.");
            }

            return cadastrado;
        }

        if (!string.IsNullOrWhiteSpace(existente?.ClienteId))
        {
            var atual = await _repositorioCliente.ObterPorIdAsync(existente.ClienteId, cancelamento);
            if (atual is not null)
            {
                return atual;
            }
        }

        throw new RegraNegocioException("Informe o cliente da ordem de serviço com um telefone válido.");
    }

    private async Task<List<ItemOrdemServico>> ResolverItensAsync(
        List<ItemOrdemServicoEntradaDto> entradas,
        CancellationToken cancelamento)
    {
        var itens = new List<ItemOrdemServico>();

        foreach (var entrada in entradas)
        {
            var tipo = string.IsNullOrWhiteSpace(entrada.Tipo)
                ? TiposItemTransacional.Servico
                : entrada.Tipo.Trim().ToLower();

            if (!TiposItemTransacional.EhValido(tipo))
            {
                throw new RegraNegocioException($"Tipo de item inválido: {entrada.Tipo}.");
            }

            if (entrada.Quantidade <= 0)
            {
                throw new RegraNegocioException("A quantidade de cada item da OS deve ser maior que zero.");
            }

            if (tipo == TiposItemTransacional.Servico)
            {
                if (string.IsNullOrWhiteSpace(entrada.ServicoId))
                {
                    throw new RegraNegocioException("Informe o serviço do item da OS.");
                }

                var servico = await _repositorioServico.ObterPorIdAsync(entrada.ServicoId, cancelamento)
                    ?? throw new RecursoNaoEncontradoException($"Serviço {entrada.ServicoId} não encontrado.");

                if (entrada.PrecoUnitario <= 0)
                {
                    throw new RegraNegocioException($"Informe o valor cobrado para {servico.Nome}.");
                }

                itens.Add(new ItemOrdemServico
                {
                    ServicoId = servico.Id,
                    Tipo = TiposItemTransacional.Servico,
                    Nome = servico.Nome,
                    Quantidade = entrada.Quantidade,
                    PrecoUnitario = entrada.PrecoUnitario,
                });

                continue;
            }

            if (string.IsNullOrWhiteSpace(entrada.ProdutoId))
            {
                throw new RegraNegocioException("Informe o produto do item da OS.");
            }

            var produto = await _repositorioProduto.ObterPorIdAsync(entrada.ProdutoId, cancelamento)
                ?? throw new RecursoNaoEncontradoException($"Produto {entrada.ProdutoId} não encontrado.");

            var preco = entrada.PrecoUnitario > 0 ? entrada.PrecoUnitario : produto.Preco;

            if (preco <= 0)
            {
                throw new RegraNegocioException($"Informe o valor cobrado para {produto.Nome}.");
            }

            itens.Add(new ItemOrdemServico
            {
                ProdutoId = produto.Id,
                Tipo = TiposItemTransacional.Produto,
                Nome = produto.Nome,
                Quantidade = entrada.Quantidade,
                PrecoUnitario = preco,
            });
        }

        return itens;
    }

    private static void Validar(OrdemServicoEntradaDto entrada, bool atualizacao = false)
    {
        if (!atualizacao && string.IsNullOrWhiteSpace(entrada.Problema))
        {
            throw new RegraNegocioException("Descreva o defeito ou as observações do aparelho.");
        }

        if (!atualizacao && string.IsNullOrWhiteSpace(entrada.Marca) && string.IsNullOrWhiteSpace(entrada.Aparelho))
        {
            throw new RegraNegocioException("Informe a marca ou o aparelho da ordem de serviço.");
        }

        if (entrada.Valor < 0)
        {
            throw new RegraNegocioException("O valor da ordem de serviço não pode ser negativo.");
        }

        if (entrada.Status is not null && !StatusOrdemServico.EhValido(entrada.Status))
        {
            throw new RegraNegocioException($"Status inválido: {entrada.Status}.");
        }

        if (entrada.Prioridade is not null && !PrioridadesOrdemServico.EhValida(entrada.Prioridade))
        {
            throw new RegraNegocioException($"Prioridade inválida: {entrada.Prioridade}.");
        }

        if (entrada.TipoAparelho is not null && !TiposAparelho.EhValido(entrada.TipoAparelho))
        {
            throw new RegraNegocioException($"Tipo de aparelho inválido: {entrada.TipoAparelho}.");
        }

        if (entrada.EstadoAparelho is not null && !EstadosAparelho.EhValido(entrada.EstadoAparelho))
        {
            throw new RegraNegocioException($"Estado do aparelho inválido: {entrada.EstadoAparelho}.");
        }
    }
}
