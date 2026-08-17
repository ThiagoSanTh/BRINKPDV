using Microsoft.EntityFrameworkCore;
using PDV.Dominio.Entidades;
using PDV.Dominio.Repositorios;
using PDV.Infraestrutura.Contexto;

namespace PDV.Repositorio;

public class RepositorioOrdemServico : IRepositorioOrdemServico
{
    private readonly PdvDbContext _contexto;

    public RepositorioOrdemServico(PdvDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IReadOnlyList<OrdemServico>> ObterTodasAsync(
        string? busca = null,
        string? status = null,
        string? clienteId = null,
        CancellationToken cancelamento = default)
    {
        var consulta = _contexto.OrdensServico.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            consulta = consulta.Where(ordem => ordem.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(clienteId))
        {
            consulta = consulta.Where(ordem => ordem.ClienteId == clienteId);
        }

        if (!string.IsNullOrWhiteSpace(busca))
        {
            var termo = busca.Trim().ToLower();
            consulta = consulta.Where(ordem =>
                ordem.Numero.ToLower().Contains(termo) ||
                ordem.Cliente.ToLower().Contains(termo) ||
                ordem.ContatoCliente.ToLower().Contains(termo) ||
                ordem.Marca.ToLower().Contains(termo) ||
                ordem.Modelo.ToLower().Contains(termo) ||
                ordem.Aparelho.ToLower().Contains(termo) ||
                ordem.Problema.ToLower().Contains(termo));
        }

        return await consulta
            .OrderByDescending(ordem => ordem.Data)
            .ThenByDescending(ordem => ordem.Numero)
            .ToListAsync(cancelamento);
    }

    public async Task<IReadOnlyList<OrdemServico>> ObterPorClienteAsync(
        string clienteId,
        CancellationToken cancelamento = default)
    {
        return await _contexto.OrdensServico
            .AsNoTracking()
            .Where(ordem => ordem.ClienteId == clienteId)
            .OrderByDescending(ordem => ordem.Data)
            .ThenByDescending(ordem => ordem.Numero)
            .ToListAsync(cancelamento);
    }

    public async Task<OrdemServico?> ObterPorIdAsync(string id, CancellationToken cancelamento = default)
    {
        return await _contexto.OrdensServico.FirstOrDefaultAsync(ordem => ordem.Id == id, cancelamento);
    }

    public async Task<int> ContarAsync(CancellationToken cancelamento = default)
    {
        return await _contexto.OrdensServico.CountAsync(cancelamento);
    }

    public async Task<OrdemServico> CriarAsync(OrdemServico ordem, CancellationToken cancelamento = default)
    {
        _contexto.OrdensServico.Add(ordem);
        await _contexto.SaveChangesAsync(cancelamento);
        return ordem;
    }

    public async Task<OrdemServico?> AtualizarAsync(OrdemServico ordem, CancellationToken cancelamento = default)
    {
        var existente = await _contexto.OrdensServico.FirstOrDefaultAsync(item => item.Id == ordem.Id, cancelamento);

        if (existente is null)
        {
            return null;
        }

        existente.ClienteId = ordem.ClienteId;
        existente.Cliente = ordem.Cliente;
        existente.ContatoCliente = ordem.ContatoCliente;
        existente.TipoAparelho = ordem.TipoAparelho;
        existente.Marca = ordem.Marca;
        existente.Modelo = ordem.Modelo;
        existente.Aparelho = ordem.Aparelho;
        existente.EstadoAparelho = ordem.EstadoAparelho;
        existente.Problema = ordem.Problema;
        existente.Status = ordem.Status;
        existente.Prioridade = ordem.Prioridade;
        existente.Valor = ordem.Valor;
        existente.Prazo = ordem.Prazo;
        existente.DataSaida = ordem.DataSaida;

        await _contexto.SaveChangesAsync(cancelamento);
        return existente;
    }

    public async Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default)
    {
        var existente = await _contexto.OrdensServico.FirstOrDefaultAsync(ordem => ordem.Id == id, cancelamento);

        if (existente is null)
        {
            return false;
        }

        _contexto.OrdensServico.Remove(existente);
        await _contexto.SaveChangesAsync(cancelamento);
        return true;
    }
}
