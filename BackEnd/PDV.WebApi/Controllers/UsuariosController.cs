using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    public async Task<ActionResult<IReadOnlyList<UsuarioDto>>> Listar(CancellationToken cancelamento)
    {
        return Ok(await _servico.ListarAsync(cancelamento));
    }

    [HttpPost]
    public async Task<ActionResult<UsuarioDto>> Criar(UsuarioEntradaDto entrada, CancellationToken cancelamento)
    {
        var usuario = await _servico.CriarAsync(entrada, cancelamento);
        return Created($"/api/usuarios/{usuario.Id}", usuario);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UsuarioDto>> Atualizar(string id, UsuarioEntradaDto entrada, CancellationToken cancelamento)
    {
        var usuario = await _servico.AtualizarAsync(id, entrada, cancelamento);
        return usuario is null ? NotFound(new { mensagem = "Usuário não encontrado." }) : Ok(usuario);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Remover(string id, CancellationToken cancelamento)
    {
        var removido = await _servico.RemoverAsync(id, cancelamento);
        return removido ? NoContent() : NotFound(new { mensagem = "Usuário não encontrado." });
    }
}
