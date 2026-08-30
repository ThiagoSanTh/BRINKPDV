using PDV.Dominio.Repositorios;
using PDV.Repositorio;
using PDV.Servico.Interfaces;
using PDV.Servico.Servicos;
using PDV.WebApi.Autenticacao;
using PDV.WebApi.Backup;

namespace PDV.WebApi.Configuracao;

public static class InjecaoDependencia
{
    public static IServiceCollection AdicionarRepositorios(this IServiceCollection servicos)
    {
        servicos.AddScoped<IRepositorioProduto, RepositorioProduto>();
        servicos.AddScoped<IRepositorioServico, RepositorioServico>();
        servicos.AddScoped<IRepositorioVenda, RepositorioVenda>();
        servicos.AddScoped<IRepositorioVendedor, RepositorioVendedor>();
        servicos.AddScoped<IRepositorioOrdemServico, RepositorioOrdemServico>();
        servicos.AddScoped<IRepositorioCliente, RepositorioCliente>();
        servicos.AddScoped<IRepositorioUsuario, RepositorioUsuario>();
        servicos.AddScoped<IRepositorioConfiguracaoLoja, RepositorioConfiguracaoLoja>();
        servicos.AddScoped<IRepositorioMovimentoCaixa, RepositorioMovimentoCaixa>();

        return servicos;
    }

    public static IServiceCollection AdicionarServicosDeDominio(this IServiceCollection servicos)
    {
        servicos.AddScoped<IServicoProduto, ServicoProduto>();
        servicos.AddScoped<IServicoServico, ServicoServico>();
        servicos.AddScoped<IServicoVenda, ServicoVenda>();
        servicos.AddScoped<IServicoVendedor, ServicoVendedor>();
        servicos.AddScoped<IServicoOrdemServico, ServicoOrdemServico>();
        servicos.AddScoped<IServicoCliente, ServicoCliente>();
        servicos.AddHttpClient<IServicoWhatsApp, ServicoWhatsApp>();
        servicos.AddScoped<IServicoUsuario, ServicoUsuario>();
        servicos.AddScoped<IServicoConfiguracaoLoja, ServicoConfiguracaoLoja>();
        servicos.AddScoped<IServicoCaixa, ServicoCaixa>();
        servicos.AddScoped<ServicoBackup>();
        servicos.AddSingleton<GeradorTokenJwt>();

        return servicos;
    }
}
