using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PDV.Dominio.Entidades;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;

namespace PDV.WebApi.Controllers;

[ApiController]
[Authorize(Roles = FuncoesUsuario.PapeisGestao)]
[Route("api/backup")]
public class BackupController : ControllerBase
{
    private readonly IServicoBackup _servico;

    public BackupController(IServicoBackup servico)
    {
        _servico = servico;
    }

    [HttpPost("criar")]
    public async Task<IActionResult> Criar(CancellationToken cancelamento)
    {
        var (arquivo, nomeArquivo) = await _servico.CriarAsync(cancelamento);
        return File(arquivo, "application/zip", nomeArquivo);
    }

    [HttpPost("validar")]
    public async Task<ActionResult<BackupResumoDto>> Validar(IFormFile arquivo, CancellationToken cancelamento)
    {
        if (arquivo is null || arquivo.Length == 0)
        {
            return BadRequest(new { mensagem = "Informe um arquivo de backup válido." });
        }

        await using var stream = arquivo.OpenReadStream();
        return Ok(await _servico.ValidarAsync(stream, cancelamento));
    }

    [HttpPost("restaurar")]
    public async Task<ActionResult<RestaurarBackupResultadoDto>> Restaurar(IFormFile arquivo, CancellationToken cancelamento)
    {
        if (arquivo is null || arquivo.Length == 0)
        {
            return BadRequest(new { mensagem = "Informe um arquivo de backup válido." });
        }

        await using var stream = arquivo.OpenReadStream();
        return Ok(await _servico.RestaurarAsync(stream, cancelamento));
    }
}
