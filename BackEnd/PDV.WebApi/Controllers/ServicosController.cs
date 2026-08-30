using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PDV.Dominio.Entidades;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;

namespace PDV.WebApi.Controllers;

[ApiController]
[Authorize(Roles = FuncoesUsuario.PapeisOficina)]
[Route("api/servicos")]
public class ServicosController : ControllerBase
{
    private readonly IServicoServico _servico;

    public ServicosController(IServicoServico servico)
    {
        _servico = servico;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ServicoCatalogoDto>>> Listar(CancellationToken cancelamento)
    {
        return Ok(await _servico.ListarAsync(cancelamento));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ServicoCatalogoDto>> Obter(string id, CancellationToken cancelamento)
    {
        var servico = await _servico.ObterAsync(id, cancelamento);
        return servico is null ? NotFound(new { mensagem = "Serviço não encontrado." }) : Ok(servico);
    }

    [HttpPost]
    public async Task<ActionResult<ServicoCatalogoDto>> Criar(ServicoCatalogoEntradaDto entrada, CancellationToken cancelamento)
    {
        var servico = await _servico.CriarAsync(entrada, cancelamento);
        return CreatedAtAction(nameof(Obter), new { id = servico.Id }, servico);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ServicoCatalogoDto>> Atualizar(
        string id,
        ServicoCatalogoEntradaDto entrada,
        CancellationToken cancelamento)
    {
        var servico = await _servico.AtualizarAsync(id, entrada, cancelamento);
        return servico is null ? NotFound(new { mensagem = "Serviço não encontrado." }) : Ok(servico);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Remover(string id, CancellationToken cancelamento)
    {
        var removido = await _servico.RemoverAsync(id, cancelamento);
        return removido ? NoContent() : NotFound(new { mensagem = "Serviço não encontrado." });
    }
}
