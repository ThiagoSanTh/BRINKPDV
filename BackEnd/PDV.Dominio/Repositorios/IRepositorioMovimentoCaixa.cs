using PDV.Dominio.Entidades;

namespace PDV.Dominio.Repositorios;

public interface IRepositorioMovimentoCaixa
{
    Task<IReadOnlyList<MovimentoCaixa>> ObterDeHojeAsync(CancellationToken cancelamento = default);

    Task<MovimentoCaixa> CriarAsync(MovimentoCaixa movimento, CancellationToken cancelamento = default);
}
