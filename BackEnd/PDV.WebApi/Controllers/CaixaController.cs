using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;

namespace PDV.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/caixa")]
public class CaixaController : ControllerBase
{
    private readonly IServicoCaixa _servico;

    public CaixaController(IServicoCaixa servico)
    {
        _servico = servico;
    }

    [HttpGet]
    public async Task<ActionResult<ResumoCaixaDto>> Obter(CancellationToken cancelamento)
    {
        return Ok(await _servico.ObterResumoAsync(cancelamento));
    }

    [HttpPost("movimentos")]
    public async Task<ActionResult<MovimentoCaixaDto>> Registrar(MovimentoCaixaEntradaDto entrada, CancellationToken cancelamento)
    {
        return Ok(await _servico.RegistrarAsync(entrada, cancelamento));
    }
}
