using PDV.Dominio.Entidades;
using PDV.Servico.Dtos;

namespace PDV.Servico.Interfaces;

public interface IServicoProduto
{
    Task<IReadOnlyList<ProdutoDto>> ListarAsync(CancellationToken cancelamento = default);

    Task<ProdutoDto?> ObterAsync(string id, CancellationToken cancelamento = default);

    Task<ProdutoDto> CriarAsync(ProdutoEntradaDto entrada, CancellationToken cancelamento = default);

    Task<ProdutoDto?> AtualizarAsync(string id, ProdutoEntradaDto entrada, CancellationToken cancelamento = default);

    Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default);
}

public interface IServicoVenda
{
    Task<IReadOnlyList<VendaDto>> ListarAsync(CancellationToken cancelamento = default);

    Task<IReadOnlyList<VendaDto>> ListarDeHojeAsync(CancellationToken cancelamento = default);

    Task<IReadOnlyList<VendaDto>> ListarPorPeriodoAsync(DateOnly inicio, DateOnly fim, CancellationToken cancelamento = default);

    Task<VendaDto?> ObterAsync(string id, CancellationToken cancelamento = default);

    Task<VendaDto> RegistrarAsync(VendaEntradaDto entrada, CancellationToken cancelamento = default);
}

public interface IServicoVendedor
{
    Task<IReadOnlyList<VendedorDto>> ListarAsync(CancellationToken cancelamento = default);

    Task<VendedorDto?> ObterAsync(string id, CancellationToken cancelamento = default);

    Task<VendedorDto> CriarAsync(VendedorEntradaDto entrada, CancellationToken cancelamento = default);

    Task<VendedorDto?> AtualizarAsync(string id, VendedorEntradaDto entrada, CancellationToken cancelamento = default);

    Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default);
}

public interface IServicoOrdemServico
{
    Task<IReadOnlyList<OrdemServicoDto>> ListarAsync(
        string? busca = null,
        string? status = null,
        string? clienteId = null,
        CancellationToken cancelamento = default);

    Task<IReadOnlyList<OrdemServicoDto>> ListarPorClienteAsync(string clienteId, CancellationToken cancelamento = default);

    Task<OrdemServicoDto?> ObterAsync(string id, CancellationToken cancelamento = default);

    Task<OrdemServicoDto> CriarAsync(OrdemServicoEntradaDto entrada, CancellationToken cancelamento = default);

    Task<OrdemServicoDto?> AtualizarAsync(string id, OrdemServicoEntradaDto entrada, CancellationToken cancelamento = default);

    Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default);
}

public interface IServicoCliente
{
    Task<IReadOnlyList<ClienteDto>> ListarAsync(CancellationToken cancelamento = default);

    Task<ClienteDto?> ObterAsync(string id, CancellationToken cancelamento = default);

    Task<ClienteDto> CriarAsync(ClienteEntradaDto entrada, CancellationToken cancelamento = default);

    Task<ClienteDto?> AtualizarAsync(string id, ClienteEntradaDto entrada, CancellationToken cancelamento = default);

    Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default);
}

public interface IServicoWhatsApp
{
    Task<ResultadoWhatsAppDto> NotificarAsync(OrdemServico ordem, string evento, CancellationToken cancelamento = default);
}

public interface IServicoConfiguracaoLoja
{
    Task<ConfiguracaoLojaDto> ObterAsync(CancellationToken cancelamento = default);

    Task<ConfiguracaoLojaDto> SalvarAsync(ConfiguracaoLojaDto entrada, CancellationToken cancelamento = default);
}

public interface IServicoUsuario
{
    Task<IReadOnlyList<UsuarioDto>> ListarAsync(CancellationToken cancelamento = default);

    Task<UsuarioDto> CriarAsync(UsuarioEntradaDto entrada, AtorUsuario ator, CancellationToken cancelamento = default);

    Task<UsuarioDto?> AtualizarAsync(string id, UsuarioEntradaDto entrada, AtorUsuario ator, CancellationToken cancelamento = default);

    Task<bool> RemoverAsync(string id, AtorUsuario ator, CancellationToken cancelamento = default);

    Task<UsuarioDto?> AutenticarAsync(CredenciaisDto credenciais, CancellationToken cancelamento = default);
}

public interface IServicoCaixa
{
    Task<ResumoCaixaDto> ObterResumoAsync(CancellationToken cancelamento = default);

    Task<MovimentoCaixaDto> RegistrarAsync(MovimentoCaixaEntradaDto entrada, CancellationToken cancelamento = default);
}
