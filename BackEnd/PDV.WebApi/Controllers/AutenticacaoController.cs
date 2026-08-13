using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;
using PDV.WebApi.Autenticacao;

namespace PDV.WebApi.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/auth")]
public class AutenticacaoController : ControllerBase
{
    private readonly IServicoUsuario _servico;
    private readonly GeradorTokenJwt _gerador;

    public AutenticacaoController(IServicoUsuario servico, GeradorTokenJwt gerador)
    {
        _servico = servico;
        _gerador = gerador;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(CredenciaisDto credenciais, CancellationToken cancelamento)
    {
        var usuario = await _servico.AutenticarAsync(credenciais, cancelamento);

        if (usuario is null)
        {
            return Unauthorized(new { mensagem = "Usuário ou senha inválidos." });
        }

        var (token, expiracao) = _gerador.Gerar(usuario);

        return Ok(new
        {
            token,
            expiracao,
            usuario,
        });
    }
}
