using Microsoft.EntityFrameworkCore;
using PDV.Dominio.Entidades;
using PDV.Dominio.Repositorios;
using PDV.Infraestrutura.Contexto;

namespace PDV.Repositorio;

public class RepositorioUsuario : IRepositorioUsuario
{
    private readonly PdvDbContext _contexto;

    public RepositorioUsuario(PdvDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IReadOnlyList<Usuario>> ObterTodosAsync(CancellationToken cancelamento = default)
    {
        return await _contexto.Usuarios
            .AsNoTracking()
            .OrderBy(usuario => usuario.NomeUsuario)
            .ToListAsync(cancelamento);
    }

    public async Task<Usuario?> ObterPorIdAsync(string id, CancellationToken cancelamento = default)
    {
        return await _contexto.Usuarios.FirstOrDefaultAsync(usuario => usuario.Id == id, cancelamento);
    }

    public async Task<Usuario?> ObterPorNomeUsuarioAsync(string nomeUsuario, CancellationToken cancelamento = default)
    {
        return await _contexto.Usuarios
            .AsNoTracking()
            .FirstOrDefaultAsync(usuario => usuario.NomeUsuario == nomeUsuario, cancelamento);
    }

    public async Task<Usuario> CriarAsync(Usuario usuario, CancellationToken cancelamento = default)
    {
        _contexto.Usuarios.Add(usuario);
        await _contexto.SaveChangesAsync(cancelamento);
        return usuario;
    }

    public async Task<Usuario?> AtualizarAsync(Usuario usuario, CancellationToken cancelamento = default)
    {
        var existente = await _contexto.Usuarios.FirstOrDefaultAsync(item => item.Id == usuario.Id, cancelamento);

        if (existente is null)
        {
            return null;
        }

        existente.NomeUsuario = usuario.NomeUsuario;
        existente.SenhaHash = usuario.SenhaHash;
        existente.Email = usuario.Email;
        existente.Funcao = usuario.Funcao;
        existente.Ativo = usuario.Ativo;

        await _contexto.SaveChangesAsync(cancelamento);
        return existente;
    }

    public async Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default)
    {
        var existente = await _contexto.Usuarios.FirstOrDefaultAsync(usuario => usuario.Id == id, cancelamento);

        if (existente is null)
        {
            return false;
        }

        _contexto.Usuarios.Remove(existente);
        await _contexto.SaveChangesAsync(cancelamento);
        return true;
    }
}
