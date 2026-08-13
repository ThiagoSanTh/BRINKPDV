using Microsoft.EntityFrameworkCore;
using PDV.Dominio.Entidades;
using PDV.Dominio.Repositorios;
using PDV.Infraestrutura.Contexto;

namespace PDV.Repositorio;

public class RepositorioCliente : IRepositorioCliente
{
    private readonly PdvDbContext _contexto;

    public RepositorioCliente(PdvDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IReadOnlyList<Cliente>> ObterTodosAsync(CancellationToken cancelamento = default)
    {
        return await _contexto.Clientes
            .AsNoTracking()
            .OrderBy(cliente => cliente.Nome)
            .ToListAsync(cancelamento);
    }

    public async Task<Cliente?> ObterPorIdAsync(string id, CancellationToken cancelamento = default)
    {
        return await _contexto.Clientes.FirstOrDefaultAsync(cliente => cliente.Id == id, cancelamento);
    }

    public async Task<Cliente?> ObterPorTelefoneAsync(string telefone, CancellationToken cancelamento = default)
    {
        return await _contexto.Clientes.FirstOrDefaultAsync(cliente => cliente.Telefone == telefone, cancelamento);
    }

    public async Task<Cliente> CriarAsync(Cliente cliente, CancellationToken cancelamento = default)
    {
        _contexto.Clientes.Add(cliente);
        await _contexto.SaveChangesAsync(cancelamento);
        return cliente;
    }

    public async Task<Cliente?> AtualizarAsync(Cliente cliente, CancellationToken cancelamento = default)
    {
        var existente = await _contexto.Clientes.FirstOrDefaultAsync(item => item.Id == cliente.Id, cancelamento);

        if (existente is null)
        {
            return null;
        }

        existente.Nome = cliente.Nome;
        existente.Telefone = cliente.Telefone;
        existente.Observacoes = cliente.Observacoes;

        await _contexto.SaveChangesAsync(cancelamento);
        return existente;
    }

    public async Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default)
    {
        var existente = await _contexto.Clientes.FirstOrDefaultAsync(cliente => cliente.Id == id, cancelamento);

        if (existente is null)
        {
            return false;
        }

        _contexto.Clientes.Remove(existente);
        await _contexto.SaveChangesAsync(cancelamento);
        return true;
    }
}
