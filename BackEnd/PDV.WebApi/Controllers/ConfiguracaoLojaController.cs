using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PDV.Dominio.Entidades;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;

namespace PDV.WebApi.Controllers;

[ApiController]
[Route("api/configuracao-loja")]
public class ConfiguracaoLojaController : ControllerBase
{
    private readonly IServicoConfiguracaoLoja _servico;

    public ConfiguracaoLojaController(IServicoConfiguracaoLoja servico)
    {
        _servico = servico;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<ConfiguracaoLojaDto>> Obter(CancellationToken cancelamento)
    {
        return Ok(await _servico.ObterAsync(cancelamento));
    }

    [HttpPut]
    [Authorize(Roles = FuncoesUsuario.PapeisGestao)]
    public async Task<ActionResult<ConfiguracaoLojaDto>> Salvar(ConfiguracaoLojaDto entrada, CancellationToken cancelamento)
    {
        return Ok(await _servico.SalvarAsync(entrada, cancelamento));
    }
}
