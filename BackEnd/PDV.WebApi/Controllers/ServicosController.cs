using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PDV.Dominio.Entidades;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;

namespace PDV.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/servicos")]
public class ServicosController : ControllerBase
{
    private readonly IServicoServico _servico;

    public ServicosController(IServicoServico servico)
    {
        _servico = servico;
    }

    [HttpGet]
    [Authorize(Roles = FuncoesUsuario.PapeisClientes)]
    public async Task<ActionResult<IReadOnlyList<ServicoDto>>> Listar(CancellationToken cancelamento)
    {
        return Ok(await _servico.ListarAsync(cancelamento));
    }

    [HttpGet("{id}")]
    [Authorize(Roles = FuncoesUsuario.PapeisClientes)]
    public async Task<ActionResult<ServicoDto>> Obter(string id, CancellationToken cancelamento)
    {
        var servico = await _servico.ObterAsync(id, cancelamento);
        return servico is null ? NotFound(new { mensagem = "Serviço não encontrado." }) : Ok(servico);
    }

    [HttpPost]
    [Authorize(Roles = FuncoesUsuario.PapeisGestao)]
    public async Task<ActionResult<ServicoDto>> Criar(ServicoEntradaDto entrada, CancellationToken cancelamento)
    {
        var servico = await _servico.CriarAsync(entrada, cancelamento);
        return CreatedAtAction(nameof(Obter), new { id = servico.Id }, servico);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = FuncoesUsuario.PapeisGestao)]
    public async Task<ActionResult<ServicoDto>> Atualizar(
        string id,
        ServicoEntradaDto entrada,
        CancellationToken cancelamento)
    {
        var servico = await _servico.AtualizarAsync(id, entrada, cancelamento);
        return servico is null ? NotFound(new { mensagem = "Serviço não encontrado." }) : Ok(servico);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = FuncoesUsuario.PapeisGestao)]
    public async Task<IActionResult> Remover(string id, CancellationToken cancelamento)
    {
        var removido = await _servico.RemoverAsync(id, cancelamento);
        return removido ? NoContent() : NotFound(new { mensagem = "Serviço não encontrado." });
    }
}
