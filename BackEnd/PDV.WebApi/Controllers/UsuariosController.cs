using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PDV.Dominio.Entidades;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;

namespace PDV.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/usuarios")]
public class UsuariosController : ControllerBase
{
    private readonly IServicoUsuario _servico;

    public UsuariosController(IServicoUsuario servico)
    {
        _servico = servico;
    }

    [HttpGet]
    [Authorize(Roles = FuncoesUsuario.PapeisGestao)]
    public async Task<ActionResult<IReadOnlyList<UsuarioDto>>> Listar(CancellationToken cancelamento)
    {
        return Ok(await _servico.ListarAsync(cancelamento));
    }

    [HttpPost]
    [Authorize(Roles = FuncoesUsuario.PapeisGestao)]
    public async Task<ActionResult<UsuarioDto>> Criar(UsuarioEntradaDto entrada, CancellationToken cancelamento)
    {
        var usuario = await _servico.CriarAsync(entrada, AtorAtual(), cancelamento);
        return Created($"/api/usuarios/{usuario.Id}", usuario);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UsuarioDto>> Atualizar(string id, UsuarioEntradaDto entrada, CancellationToken cancelamento)
    {
        var usuario = await _servico.AtualizarAsync(id, entrada, AtorAtual(), cancelamento);
        return usuario is null ? NotFound(new { mensagem = "Usuário não encontrado." }) : Ok(usuario);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = FuncoesUsuario.PapeisGestao)]
    public async Task<IActionResult> Remover(string id, CancellationToken cancelamento)
    {
        var removido = await _servico.RemoverAsync(id, AtorAtual(), cancelamento);
        return removido ? NoContent() : NotFound(new { mensagem = "Usuário não encontrado." });
    }

    private AtorUsuario AtorAtual()
    {
        var id = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? string.Empty;
        var funcao = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        return new AtorUsuario(id, funcao);
    }
}
