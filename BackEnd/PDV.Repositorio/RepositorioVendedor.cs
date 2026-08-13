using Microsoft.EntityFrameworkCore;
using PDV.Dominio.Entidades;
using PDV.Dominio.Repositorios;
using PDV.Infraestrutura.Contexto;

namespace PDV.Repositorio;

public class RepositorioVendedor : IRepositorioVendedor
{
    private readonly PdvDbContext _contexto;

    public RepositorioVendedor(PdvDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IReadOnlyList<Vendedor>> ObterTodosAsync(CancellationToken cancelamento = default)
    {
        return await _contexto.Vendedores
            .AsNoTracking()
            .OrderBy(vendedor => vendedor.Nome)
            .ToListAsync(cancelamento);
    }

    public async Task<Vendedor?> ObterPorIdAsync(string id, CancellationToken cancelamento = default)
    {
        return await _contexto.Vendedores.FirstOrDefaultAsync(vendedor => vendedor.Id == id, cancelamento);
    }

    public async Task<Vendedor> CriarAsync(Vendedor vendedor, CancellationToken cancelamento = default)
    {
        _contexto.Vendedores.Add(vendedor);
        await _contexto.SaveChangesAsync(cancelamento);
        return vendedor;
    }

    public async Task<Vendedor?> AtualizarAsync(Vendedor vendedor, CancellationToken cancelamento = default)
    {
        var existente = await _contexto.Vendedores.FirstOrDefaultAsync(item => item.Id == vendedor.Id, cancelamento);

        if (existente is null)
        {
            return null;
        }

        existente.Nome = vendedor.Nome;
        existente.Email = vendedor.Email;
        existente.Telefone = vendedor.Telefone;
        existente.Comissao = vendedor.Comissao;
        existente.TotalVendas = vendedor.TotalVendas;
        existente.Ativo = vendedor.Ativo;
        existente.DataEntrada = vendedor.DataEntrada;

        await _contexto.SaveChangesAsync(cancelamento);
        return existente;
    }

    public async Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default)
    {
        var existente = await _contexto.Vendedores.FirstOrDefaultAsync(vendedor => vendedor.Id == id, cancelamento);

        if (existente is null)
        {
            return false;
        }

        _contexto.Vendedores.Remove(existente);
        await _contexto.SaveChangesAsync(cancelamento);
        return true;
    }
}
