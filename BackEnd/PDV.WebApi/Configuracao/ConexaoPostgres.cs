namespace PDV.WebApi.Configuracao;

public static class ConexaoPostgres
{
    public static string? Resolver(IConfiguration configuracao)
    {
        foreach (var candidato in new[]
        {
            Environment.GetEnvironmentVariable("PDV_POSTGRES"),
            Environment.GetEnvironmentVariable("DATABASE_URL"),
            configuracao["ConnectionStrings:Postgres"],
            configuracao.GetConnectionString("Postgres"),
        })
        {
            if (!string.IsNullOrWhiteSpace(candidato))
            {
                return Normalizar(candidato);
            }
        }

        return null;
    }

    public static string? Normalizar(string? conexao)
    {
        if (string.IsNullOrWhiteSpace(conexao))
        {
            return null;
        }

        var texto = conexao.Trim().Trim('"').Trim('\'');

        if (texto.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
            || texto.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            return DeUri(texto);
        }

        if (!texto.Contains("SSL Mode", StringComparison.OrdinalIgnoreCase)
            && !texto.Contains("SslMode", StringComparison.OrdinalIgnoreCase))
        {
            texto = texto.TrimEnd(';') + ";SSL Mode=Require;Trust Server Certificate=true";
        }

        return texto;
    }

    public static bool PareceHostIpv6Somente(string conexao)
    {
        return conexao.Contains("db.", StringComparison.OrdinalIgnoreCase)
            && conexao.Contains(".supabase.co", StringComparison.OrdinalIgnoreCase)
            && !conexao.Contains("pooler.supabase.com", StringComparison.OrdinalIgnoreCase);
    }

    public static string? ExtrairHost(string conexao)
    {
        foreach (var parte in conexao.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            var igual = parte.IndexOf('=');
            if (igual <= 0)
            {
                continue;
            }

            var chave = parte[..igual];
            if (chave.Equals("Host", StringComparison.OrdinalIgnoreCase)
                || chave.Equals("Server", StringComparison.OrdinalIgnoreCase))
            {
                return parte[(igual + 1)..];
            }
        }

        return null;
    }

    private static string DeUri(string uriTexto)
    {
        var uri = new Uri(uriTexto.Replace("postgresql://", "postgres://", StringComparison.OrdinalIgnoreCase));
        var usuarioSenha = uri.UserInfo.Split(':', 2);
        var usuario = Uri.UnescapeDataString(usuarioSenha[0]);
        var senha = usuarioSenha.Length > 1 ? Uri.UnescapeDataString(usuarioSenha[1]) : string.Empty;
        var banco = uri.AbsolutePath.Trim('/');
        var porta = uri.IsDefaultPort ? 5432 : uri.Port;

        return
            $"Host={uri.Host};Port={porta};Database={banco};Username={usuario};Password={senha};" +
            "SSL Mode=Require;Trust Server Certificate=true";
    }
}
