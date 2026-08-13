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

        if (!await contexto.Vendedores.AnyAsync(cancelamento))
        {
            contexto.Vendedores.Add(new Vendedor
            {
                Id = "vendedor-padrao",
                Nome = "Vendedor Padrão",
                Email = "vendedor@brinkpdv.local",
                Telefone = "(00) 00000-0000",
                Comissao = 5m,
                Ativo = true,
            });
        }

        if (!await contexto.Produtos.AnyAsync(cancelamento))
        {
            contexto.Produtos.AddRange(
                new Produto
                {
                    Sku = "SKU-001",
                    Nome = "Café Especial",
                    Categoria = "Bebidas",
                    Preco = 12.90m,
                    PrecoCusto = 6.50m,
                    Estoque = 25,
                },
                new Produto
                {
                    Sku = "SKU-002",
                    Nome = "Sanduíche Artesanal",
                    Categoria = "Lanches",
                    Preco = 24.50m,
                    PrecoCusto = 11.00m,
                    Estoque = 15,
                },
                new Produto
                {
                    Sku = "SKU-003",
                    Nome = "Pão de Queijo",
                    Categoria = "Padaria",
                    Preco = 6.90m,
                    PrecoCusto = 2.80m,
                    Estoque = 40,
                },
                new Produto
                {
                    Sku = "CEL-001",
                    Nome = "Capa de Celular iPhone 15",
                    Categoria = "Acessórios",
                    Preco = 49.90m,
                    PrecoCusto = 18.00m,
                    Estoque = 30,
                });
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
