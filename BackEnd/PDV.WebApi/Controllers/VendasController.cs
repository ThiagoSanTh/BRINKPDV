using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PDV.Dominio.Entidades;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;

namespace PDV.WebApi.Controllers;

[ApiController]
[Authorize(Roles = FuncoesUsuario.PapeisVendas)]
[Route("api/vendas")]
public class VendasController : ControllerBase
{
    private readonly IServicoVenda _servico;

    public VendasController(IServicoVenda servico)
    {
        _servico = servico;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<VendaDto>>> Listar(CancellationToken cancelamento)
    {
        return Ok(await _servico.ListarAsync(cancelamento));
    }

    [HttpGet("hoje")]
    public async Task<ActionResult<IReadOnlyList<VendaDto>>> ListarDeHoje(CancellationToken cancelamento)
    {
        return Ok(await _servico.ListarDeHojeAsync(cancelamento));
    }

    [HttpGet("periodo")]
    public async Task<ActionResult<IReadOnlyList<VendaDto>>> ListarPorPeriodo(
        [FromQuery] DateOnly inicio,
        [FromQuery] DateOnly fim,
        CancellationToken cancelamento)
    {
        return Ok(await _servico.ListarPorPeriodoAsync(inicio, fim, cancelamento));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VendaDto>> Obter(string id, CancellationToken cancelamento)
    {
        var venda = await _servico.ObterAsync(id, cancelamento);
        return venda is null ? NotFound(new { mensagem = "Venda não encontrada." }) : Ok(venda);
    }

    [HttpPost]
    public async Task<ActionResult<VendaDto>> Registrar(VendaEntradaDto entrada, CancellationToken cancelamento)
    {
        var venda = await _servico.RegistrarAsync(entrada, cancelamento);
        return CreatedAtAction(nameof(Obter), new { id = venda.Id }, venda);
    }
}
