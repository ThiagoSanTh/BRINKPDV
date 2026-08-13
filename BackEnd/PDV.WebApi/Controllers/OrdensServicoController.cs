using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;

namespace PDV.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/ordens-servico")]
public class OrdensServicoController : ControllerBase
{
    private readonly IServicoOrdemServico _servico;

    public OrdensServicoController(IServicoOrdemServico servico)
    {
        _servico = servico;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrdemServicoDto>>> Listar(
        [FromQuery] string? busca,
        [FromQuery] string? status,
        [FromQuery] string? clienteId,
        CancellationToken cancelamento)
    {
        return Ok(await _servico.ListarAsync(busca, status, clienteId, cancelamento));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrdemServicoDto>> Obter(string id, CancellationToken cancelamento)
    {
        var ordem = await _servico.ObterAsync(id, cancelamento);
        return ordem is null ? NotFound(new { mensagem = "Ordem de serviço não encontrada." }) : Ok(ordem);
    }

    [HttpPost]
    public async Task<ActionResult<OrdemServicoDto>> Criar(OrdemServicoEntradaDto entrada, CancellationToken cancelamento)
    {
        var ordem = await _servico.CriarAsync(entrada, cancelamento);
        return CreatedAtAction(nameof(Obter), new { id = ordem.Id }, ordem);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<OrdemServicoDto>> Atualizar(
        string id,
        OrdemServicoEntradaDto entrada,
        CancellationToken cancelamento)
    {
        var ordem = await _servico.AtualizarAsync(id, entrada, cancelamento);
        return ordem is null ? NotFound(new { mensagem = "Ordem de serviço não encontrada." }) : Ok(ordem);
    }
}
