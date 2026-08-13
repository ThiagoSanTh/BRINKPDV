using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;

namespace PDV.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/produtos")]
public class ProdutosController : ControllerBase
{
    private readonly IServicoProduto _servico;

    public ProdutosController(IServicoProduto servico)
    {
        _servico = servico;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProdutoDto>>> Listar(CancellationToken cancelamento)
    {
        return Ok(await _servico.ListarAsync(cancelamento));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProdutoDto>> Obter(string id, CancellationToken cancelamento)
    {
        var produto = await _servico.ObterAsync(id, cancelamento);
        return produto is null ? NotFound(new { mensagem = "Produto não encontrado." }) : Ok(produto);
    }

    [HttpPost]
    public async Task<ActionResult<ProdutoDto>> Criar(ProdutoEntradaDto entrada, CancellationToken cancelamento)
    {
        var produto = await _servico.CriarAsync(entrada, cancelamento);
        return CreatedAtAction(nameof(Obter), new { id = produto.Id }, produto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProdutoDto>> Atualizar(string id, ProdutoEntradaDto entrada, CancellationToken cancelamento)
    {
        var produto = await _servico.AtualizarAsync(id, entrada, cancelamento);
        return produto is null ? NotFound(new { mensagem = "Produto não encontrado." }) : Ok(produto);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Remover(string id, CancellationToken cancelamento)
    {
        var removido = await _servico.RemoverAsync(id, cancelamento);
        return removido ? NoContent() : NotFound(new { mensagem = "Produto não encontrado." });
    }
}
