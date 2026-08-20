using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PDV.Dominio.Entidades;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;

namespace PDV.WebApi.Controllers;

[ApiController]
[Authorize(Roles = FuncoesUsuario.PapeisClientes)]
[Route("api/clientes")]
public class ClientesController : ControllerBase
{
    private readonly IServicoCliente _servico;
    private readonly IServicoOrdemServico _ordens;

    public ClientesController(IServicoCliente servico, IServicoOrdemServico ordens)
    {
        _servico = servico;
        _ordens = ordens;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ClienteDto>>> Listar(CancellationToken cancelamento)
    {
        return Ok(await _servico.ListarAsync(cancelamento));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ClienteDto>> Obter(string id, CancellationToken cancelamento)
    {
        var cliente = await _servico.ObterAsync(id, cancelamento);
        return cliente is null ? NotFound(new { mensagem = "Cliente não encontrado." }) : Ok(cliente);
    }

    [HttpGet("{id}/ordens")]
    [Authorize(Roles = FuncoesUsuario.PapeisOficina)]
    public async Task<ActionResult<IReadOnlyList<OrdemServicoDto>>> Historico(string id, CancellationToken cancelamento)
    {
        var cliente = await _servico.ObterAsync(id, cancelamento);
        if (cliente is null)
        {
            return NotFound(new { mensagem = "Cliente não encontrado." });
        }

        return Ok(await _ordens.ListarPorClienteAsync(id, cancelamento));
    }

    [HttpPost]
    public async Task<ActionResult<ClienteDto>> Criar(ClienteEntradaDto entrada, CancellationToken cancelamento)
    {
        var cliente = await _servico.CriarAsync(entrada, cancelamento);
        return CreatedAtAction(nameof(Obter), new { id = cliente.Id }, cliente);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ClienteDto>> Atualizar(string id, ClienteEntradaDto entrada, CancellationToken cancelamento)
    {
        var cliente = await _servico.AtualizarAsync(id, entrada, cancelamento);
        return cliente is null ? NotFound(new { mensagem = "Cliente não encontrado." }) : Ok(cliente);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Remover(string id, CancellationToken cancelamento)
    {
        var removido = await _servico.RemoverAsync(id, cancelamento);
        return removido ? NoContent() : NotFound(new { mensagem = "Cliente não encontrado." });
    }
}
