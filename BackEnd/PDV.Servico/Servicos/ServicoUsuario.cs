using PDV.Dominio.Entidades;
using PDV.Dominio.Excecoes;
using PDV.Dominio.Repositorios;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;
using PDV.Servico.Mapeamentos;

namespace PDV.Servico.Servicos;

public class ServicoUsuario : IServicoUsuario
{
    private const int SenhaMinima = 8;
    private readonly IRepositorioUsuario _repositorio;

    public ServicoUsuario(IRepositorioUsuario repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<IReadOnlyList<UsuarioDto>> ListarAsync(CancellationToken cancelamento = default)
    {
        var usuarios = await _repositorio.ObterTodosAsync(cancelamento);
        return usuarios.Select(usuario => usuario.ParaDto()).ToList();
    }

    public async Task<UsuarioDto> CriarAsync(
        UsuarioEntradaDto entrada,
        AtorUsuario ator,
        CancellationToken cancelamento = default)
    {
        if (string.IsNullOrWhiteSpace(entrada.NomeUsuario))
        {
            throw new RegraNegocioException("Informe o nome de usuário.");
        }

        if (string.IsNullOrWhiteSpace(entrada.Senha) || entrada.Senha.Length < SenhaMinima)
        {
            throw new RegraNegocioException("A senha deve ter no mínimo 8 caracteres.");
        }

        var funcao = string.IsNullOrWhiteSpace(entrada.Funcao) ? FuncoesUsuario.Vendedor : entrada.Funcao;

        if (!FuncoesUsuario.EhValida(funcao))
        {
            throw new RegraNegocioException($"Função inválida: {funcao}.");
        }

        if (!FuncoesUsuario.PodeCriarFuncao(ator.Funcao, funcao))
        {
            throw new RegraNegocioException($"Você não pode criar usuários com a função {funcao}.");
        }

        var existente = await _repositorio.ObterPorNomeUsuarioAsync(entrada.NomeUsuario.Trim(), cancelamento);

        if (existente is not null)
        {
            throw new RegraNegocioException("Já existe um usuário com esse nome.");
        }

        var usuario = new Usuario
        {
            NomeUsuario = entrada.NomeUsuario.Trim(),
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(entrada.Senha),
            Email = string.IsNullOrWhiteSpace(entrada.Email) ? null : entrada.Email.Trim(),
            Funcao = funcao,
            Ativo = entrada.Ativo,
            CriadoEm = DateTime.UtcNow,
        };

        var criado = await _repositorio.CriarAsync(usuario, cancelamento);
        return criado.ParaDto();
    }

    public async Task<UsuarioDto?> AtualizarAsync(
        string id,
        UsuarioEntradaDto entrada,
        AtorUsuario ator,
        CancellationToken cancelamento = default)
    {
        var existente = await _repositorio.ObterPorIdAsync(id, cancelamento);

        if (existente is null)
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(entrada.NomeUsuario))
        {
            throw new RegraNegocioException("Informe o nome de usuário.");
        }

        var ehProprio = string.Equals(existente.Id, ator.Id, StringComparison.Ordinal);
        var funcao = string.IsNullOrWhiteSpace(entrada.Funcao) ? existente.Funcao : entrada.Funcao;

        if (!FuncoesUsuario.EhValida(funcao))
        {
            throw new RegraNegocioException($"Função inválida: {funcao}.");
        }

        if (ehProprio)
        {
            funcao = existente.Funcao;
        }
        else if (!FuncoesUsuario.PodeGerenciarUsuario(ator.Funcao, existente.Funcao)
                 || !FuncoesUsuario.PodeCriarFuncao(ator.Funcao, funcao))
        {
            throw new RegraNegocioException("Você não pode alterar este usuário.");
        }

        if (!string.IsNullOrWhiteSpace(entrada.Senha) && entrada.Senha.Length < SenhaMinima)
        {
            throw new RegraNegocioException("A senha deve ter no mínimo 8 caracteres.");
        }

        existente.NomeUsuario = entrada.NomeUsuario.Trim();
        existente.Email = string.IsNullOrWhiteSpace(entrada.Email) ? null : entrada.Email.Trim();
        existente.Funcao = funcao;
        existente.Ativo = ehProprio ? existente.Ativo : entrada.Ativo;

        if (!string.IsNullOrWhiteSpace(entrada.Senha))
        {
            existente.SenhaHash = BCrypt.Net.BCrypt.HashPassword(entrada.Senha);
        }

        var atualizado = await _repositorio.AtualizarAsync(existente, cancelamento);
        return atualizado?.ParaDto();
    }

    public async Task<bool> RemoverAsync(string id, AtorUsuario ator, CancellationToken cancelamento = default)
    {
        var existente = await _repositorio.ObterPorIdAsync(id, cancelamento);

        if (existente is null)
        {
            return false;
        }

        if (string.Equals(existente.Id, ator.Id, StringComparison.Ordinal))
        {
            throw new RegraNegocioException("Você não pode remover o próprio usuário.");
        }

        if (existente.NomeUsuario == "admin")
        {
            throw new RegraNegocioException("O usuário admin não pode ser removido.");
        }

        if (!FuncoesUsuario.PodeGerenciarUsuario(ator.Funcao, existente.Funcao))
        {
            throw new RegraNegocioException("Você não pode remover este usuário.");
        }

        return await _repositorio.RemoverAsync(id, cancelamento);
    }

    public async Task<UsuarioDto?> AutenticarAsync(CredenciaisDto credenciais, CancellationToken cancelamento = default)
    {
        if (string.IsNullOrWhiteSpace(credenciais.NomeUsuario) || string.IsNullOrWhiteSpace(credenciais.Senha))
        {
            return null;
        }

        var usuario = await _repositorio.ObterPorNomeUsuarioAsync(credenciais.NomeUsuario.Trim(), cancelamento);

        if (usuario is null || !usuario.Ativo)
        {
            return null;
        }

        var senhaConfere = BCrypt.Net.BCrypt.Verify(credenciais.Senha, usuario.SenhaHash);

        return senhaConfere ? usuario.ParaDto() : null;
    }
}
