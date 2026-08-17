using Microsoft.EntityFrameworkCore;
using PDV.Dominio.Entidades;
using PDV.Infraestrutura.Contexto;

namespace PDV.WebApi.Dados;

public static class InicializadorBanco
{
    public static async Task PrepararAsync(IServiceProvider provedor, ILogger logger, CancellationToken cancelamento = default)
    {
        using var escopo = provedor.CreateScope();
        var contexto = escopo.ServiceProvider.GetRequiredService<PdvDbContext>();

        await contexto.Database.MigrateAsync(cancelamento);
        await RemoverDadosDeTesteAsync(contexto, logger, cancelamento);

        var ambiente = provedor.GetRequiredService<IHostEnvironment>();
        var senhaInicial = Environment.GetEnvironmentVariable("PDV_ADMIN_SENHA");

        if (string.IsNullOrWhiteSpace(senhaInicial) && ambiente.IsDevelopment())
        {
            senhaInicial = "admin";
        }

        if (!await contexto.Usuarios.AnyAsync(cancelamento))
        {
            if (string.IsNullOrWhiteSpace(senhaInicial))
            {
                logger.LogWarning(
                    "Nenhum usuário no banco. Defina a variável PDV_ADMIN_SENHA para criar o administrador inicial.");
            }
            else
            {
                contexto.Usuarios.Add(new Usuario
                {
                    NomeUsuario = "admin",
                    SenhaHash = BCrypt.Net.BCrypt.HashPassword(senhaInicial),
                    Email = "admin@brinkpdv.local",
                    Funcao = FuncoesUsuario.Administrador,
                    Ativo = true,
                });

                logger.LogInformation("Usuário administrador inicial criado.");
            }
        }

        if (!await contexto.ConfiguracoesLoja.AnyAsync(cancelamento))
        {
            contexto.ConfiguracoesLoja.Add(new ConfiguracaoLoja
            {
                NomeLoja = "BRINKPDV",
                ComprovanteCabecalho = "Obrigado pela preferência!",
                ComprovanteRodape = "Volte sempre",
            });
        }

        await contexto.SaveChangesAsync(cancelamento);
        await SincronizarClientesDasOrdensAsync(contexto, logger, cancelamento);
    }

    private static async Task RemoverDadosDeTesteAsync(
        PdvDbContext contexto,
        ILogger logger,
        CancellationToken cancelamento)
    {
        var loja = await contexto.ConfiguracoesLoja.AsNoTracking().FirstOrDefaultAsync(cancelamento);
        var temLixoDeTeste =
            (loja?.NomeLoja?.Contains("Playwright", StringComparison.OrdinalIgnoreCase) ?? false)
            || await contexto.Produtos.AnyAsync(
                produto => produto.Nome.Contains("Playwright")
                    || produto.Nome.Contains("Produto Validação"),
                cancelamento);

        if (!temLixoDeTeste)
        {
            return;
        }

        await contexto.Database.ExecuteSqlRawAsync(
            """
            DELETE FROM cash_movements;
            DELETE FROM sales;
            DELETE FROM service_orders;
            DELETE FROM clients;
            DELETE FROM products;
            DELETE FROM salespersons;
            DELETE FROM store_settings;
            DELETE FROM users WHERE username IS DISTINCT FROM 'admin';
            """,
            cancelamento);

        contexto.ChangeTracker.Clear();
        logger.LogInformation("Dados de teste removidos. O banco ficou só com o login admin.");
    }

    private static async Task SincronizarClientesDasOrdensAsync(
        PdvDbContext contexto,
        ILogger logger,
        CancellationToken cancelamento)
    {
        var ordens = await contexto.OrdensServico.ToListAsync(cancelamento);

        foreach (var ordem in ordens)
        {
            if (ordem.Status == "Concluída")
            {
                ordem.Status = StatusOrdemServico.Entregue;
                ordem.DataSaida ??= ordem.Data;
            }

            if (string.IsNullOrWhiteSpace(ordem.TipoAparelho))
            {
                ordem.TipoAparelho = TiposAparelho.Outro;
            }

            if (string.IsNullOrWhiteSpace(ordem.EstadoAparelho))
            {
                ordem.EstadoAparelho = EstadosAparelho.Bom;
            }

            if (string.IsNullOrWhiteSpace(ordem.Marca) && !string.IsNullOrWhiteSpace(ordem.Aparelho))
            {
                var partes = ordem.Aparelho.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                ordem.Marca = partes.Length > 0 ? partes[0] : ordem.Aparelho;
                ordem.Modelo = partes.Length > 1 ? partes[1] : string.Empty;
            }

            if (string.IsNullOrWhiteSpace(ordem.Aparelho))
            {
                ordem.Aparelho = $"{ordem.Marca} {ordem.Modelo}".Trim();
            }

            if (!string.IsNullOrWhiteSpace(ordem.ClienteId))
            {
                continue;
            }

            var telefone = TelefoneCliente.SomenteDigitos(ordem.ContatoCliente);
            if (string.IsNullOrWhiteSpace(ordem.Cliente) || string.IsNullOrWhiteSpace(telefone))
            {
                continue;
            }

            var cliente = await contexto.Clientes.FirstOrDefaultAsync(
                item => item.Telefone == telefone,
                cancelamento);

            if (cliente is null)
            {
                cliente = new Cliente
                {
                    Nome = ordem.Cliente.Trim(),
                    Telefone = telefone,
                };
                contexto.Clientes.Add(cliente);
                await contexto.SaveChangesAsync(cancelamento);
            }

            ordem.ClienteId = cliente.Id;
            ordem.ContatoCliente = telefone;
        }

        await contexto.SaveChangesAsync(cancelamento);
        logger.LogInformation("Cadastro de clientes sincronizado a partir das ordens de serviço existentes.");
    }
}
