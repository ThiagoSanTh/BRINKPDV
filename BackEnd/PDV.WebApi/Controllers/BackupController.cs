using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PDV.Dominio.Entidades;
using PDV.WebApi.Backup;
using System.Text.Json;

namespace PDV.WebApi.Controllers;

[ApiController]
[Authorize(Roles = FuncoesUsuario.PapeisGestao)]
[Route("api/backup")]
public class BackupController : ControllerBase
{
    private readonly ServicoBackup _servico;
    private static readonly JsonSerializerOptions OpcoesJson = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public BackupController(ServicoBackup servico)
    {
        _servico = servico;
    }

    [HttpGet]
    public async Task<IActionResult> Criar(CancellationToken cancelamento)
    {
        var (conteudo, nomeArquivo, manifest) = await _servico.CriarAsync(cancelamento);
        Response.Headers["X-Brinkpdv-Backup-Manifest"] = Uri.EscapeDataString(JsonSerializer.Serialize(manifest, OpcoesJson));
        return File(conteudo, "application/octet-stream", nomeArquivo);
    }

    [HttpPost("validar")]
    [RequestSizeLimit(100_000_000)]
    public async Task<ActionResult<ResumoBackupDto>> Validar([FromForm] IFormFile arquivo, CancellationToken cancelamento)
    {
        if (arquivo.Length == 0)
        {
            return BadRequest(new { mensagem = "Selecione um arquivo de backup." });
        }

        await using var stream = arquivo.OpenReadStream();
        return Ok(await _servico.ValidarAsync(stream, arquivo.FileName, cancelamento));
    }

    [HttpPost("restaurar")]
    [RequestSizeLimit(100_000_000)]
    public async Task<ActionResult<ResultadoRestoreDto>> Restaurar([FromForm] IFormFile arquivo, CancellationToken cancelamento)
    {
        if (arquivo.Length == 0)
        {
            return BadRequest(new { mensagem = "Selecione um arquivo de backup." });
        }

        await using var stream = arquivo.OpenReadStream();
        return Ok(await _servico.RestaurarAsync(stream, arquivo.FileName, cancelamento));
    }
}
