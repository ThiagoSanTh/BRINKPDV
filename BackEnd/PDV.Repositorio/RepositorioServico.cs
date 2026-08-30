using Microsoft.EntityFrameworkCore;
using PDV.Dominio.Entidades;
using PDV.Dominio.Repositorios;
using PDV.Infraestrutura.Contexto;

namespace PDV.Repositorio;

public class RepositorioServico : IRepositorioServico
{
    private readonly PdvDbContext _contexto;

    public RepositorioServico(PdvDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IReadOnlyList<Servico>> ObterTodosAsync(CancellationToken cancelamento = default)
    {
        return await _contexto.Servicos
            .AsNoTracking()
            .OrderBy(servico => servico.Nome)
            .ToListAsync(cancelamento);
    }

    public async Task<Servico?> ObterPorIdAsync(string id, CancellationToken cancelamento = default)
    {
        return await _contexto.Servicos.FirstOrDefaultAsync(servico => servico.Id == id, cancelamento);
    }

    public async Task<Servico?> ObterPorNomeAsync(string nome, CancellationToken cancelamento = default)
    {
        var normalizado = nome.Trim().ToLower();
        return await _contexto.Servicos.FirstOrDefaultAsync(servico => servico.Nome.ToLower() == normalizado, cancelamento);
    }

    public async Task<Servico> CriarAsync(Servico servico, CancellationToken cancelamento = default)
    {
        _contexto.Servicos.Add(servico);
        await _contexto.SaveChangesAsync(cancelamento);
        return servico;
    }

    public async Task<Servico?> AtualizarAsync(Servico servico, CancellationToken cancelamento = default)
    {
        var existente = await _contexto.Servicos.FirstOrDefaultAsync(item => item.Id == servico.Id, cancelamento);

        if (existente is null)
        {
            return null;
        }

        existente.Nome = servico.Nome;
        existente.Descricao = servico.Descricao;
        existente.PrecoPadrao = servico.PrecoPadrao;
        existente.Ativo = servico.Ativo;

        await _contexto.SaveChangesAsync(cancelamento);
        return existente;
    }

    public async Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default)
    {
        var existente = await _contexto.Servicos.FirstOrDefaultAsync(servico => servico.Id == id, cancelamento);

        if (existente is null)
        {
            return false;
        }

        _contexto.Servicos.Remove(existente);
        await _contexto.SaveChangesAsync(cancelamento);
        return true;
    }
}
