using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PDV.Dominio.Entidades;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;

namespace PDV.WebApi.Controllers;

[ApiController]
[Authorize(Roles = FuncoesUsuario.PapeisVendas)]
[Route("api/vendedores")]
public class VendedoresController : ControllerBase
{
    private readonly IServicoVendedor _servico;

    public VendedoresController(IServicoVendedor servico)
    {
        _servico = servico;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<VendedorDto>>> Listar(CancellationToken cancelamento)
    {
        return Ok(await _servico.ListarAsync(cancelamento));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VendedorDto>> Obter(string id, CancellationToken cancelamento)
    {
        var vendedor = await _servico.ObterAsync(id, cancelamento);
        return vendedor is null ? NotFound(new { mensagem = "Vendedor não encontrado." }) : Ok(vendedor);
    }

    [HttpPost]
    [Authorize(Roles = FuncoesUsuario.PapeisGestao)]
    public async Task<ActionResult<VendedorDto>> Criar(VendedorEntradaDto entrada, CancellationToken cancelamento)
    {
        var vendedor = await _servico.CriarAsync(entrada, cancelamento);
        return CreatedAtAction(nameof(Obter), new { id = vendedor.Id }, vendedor);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = FuncoesUsuario.PapeisGestao)]
    public async Task<ActionResult<VendedorDto>> Atualizar(string id, VendedorEntradaDto entrada, CancellationToken cancelamento)
    {
        var vendedor = await _servico.AtualizarAsync(id, entrada, cancelamento);
        return vendedor is null ? NotFound(new { mensagem = "Vendedor não encontrado." }) : Ok(vendedor);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = FuncoesUsuario.PapeisGestao)]
    public async Task<IActionResult> Remover(string id, CancellationToken cancelamento)
    {
        var removido = await _servico.RemoverAsync(id, cancelamento);
        return removido ? NoContent() : NotFound(new { mensagem = "Vendedor não encontrado." });
    }
}
