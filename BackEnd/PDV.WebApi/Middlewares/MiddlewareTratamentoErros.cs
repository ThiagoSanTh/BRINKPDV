using System.Text.Json;
using PDV.Dominio.Excecoes;

namespace PDV.WebApi.Middlewares;

public class MiddlewareTratamentoErros
{
    private readonly RequestDelegate _proximo;
    private readonly ILogger<MiddlewareTratamentoErros> _logger;

    public MiddlewareTratamentoErros(RequestDelegate proximo, ILogger<MiddlewareTratamentoErros> logger)
    {
        _proximo = proximo;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext contexto)
    {
        try
        {
            await _proximo(contexto);
        }
        catch (RegraNegocioException excecao)
        {
            await ResponderAsync(contexto, StatusCodes.Status400BadRequest, excecao.Message);
        }
        catch (RecursoNaoEncontradoException excecao)
        {
            await ResponderAsync(contexto, StatusCodes.Status404NotFound, excecao.Message);
        }
        catch (Exception excecao) when (EhFalhaDeBanco(excecao))
        {
            _logger.LogError(excecao, "Falha de banco em {Caminho}", contexto.Request.Path);
            await ResponderAsync(
                contexto,
                StatusCodes.Status503ServiceUnavailable,
                "Não foi possível conectar ao banco. No Railway, PDV_POSTGRES precisa ser o Session pooler IPv4 do Supabase.");
        }
        catch (Exception excecao)
        {
            _logger.LogError(excecao, "Falha não tratada em {Caminho}", contexto.Request.Path);
            await ResponderAsync(contexto, StatusCodes.Status500InternalServerError, "Erro interno no servidor.");
        }
    }

    private static async Task ResponderAsync(HttpContext contexto, int status, string mensagem)
    {
        if (contexto.Response.HasStarted)
        {
            return;
        }

        contexto.Response.Clear();
        contexto.Response.StatusCode = status;
        contexto.Response.ContentType = "application/json; charset=utf-8";

        var corpo = JsonSerializer.Serialize(new { mensagem });
        await contexto.Response.WriteAsync(corpo);
    }

    private static bool EhFalhaDeBanco(Exception excecao)
    {
        for (var atual = excecao; atual is not null; atual = atual.InnerException)
        {
            var nome = atual.GetType().FullName ?? string.Empty;
            if (nome.Contains("Npgsql", StringComparison.Ordinal)
                || atual is TimeoutException or System.Net.Sockets.SocketException)
            {
                return true;
            }
        }

        return false;
    }
}
