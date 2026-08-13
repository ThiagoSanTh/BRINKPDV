using PDV.Dominio.Entidades;

namespace PDV.Dominio.Repositorios;

public interface IRepositorioUsuario
{
    Task<IReadOnlyList<Usuario>> ObterTodosAsync(CancellationToken cancelamento = default);

    Task<Usuario?> ObterPorIdAsync(string id, CancellationToken cancelamento = default);

    Task<Usuario?> ObterPorNomeUsuarioAsync(string nomeUsuario, CancellationToken cancelamento = default);

    Task<Usuario> CriarAsync(Usuario usuario, CancellationToken cancelamento = default);

    Task<Usuario?> AtualizarAsync(Usuario usuario, CancellationToken cancelamento = default);

    Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default);
}
