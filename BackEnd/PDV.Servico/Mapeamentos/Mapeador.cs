using PDV.Dominio.Entidades;
using PDV.Servico.Dtos;

namespace PDV.Servico.Mapeamentos;

public static class Mapeador
{
    public static ProdutoDto ParaDto(this Produto produto) => new(
        produto.Id,
        produto.Sku,
        produto.Nome,
        produto.Categoria,
        produto.Preco,
        produto.PrecoCusto,
        produto.Estoque,
        produto.CodigoBarras,
        produto.Imagem,
        produto.EstoqueBaixo);

    public static ItemVendaDto ParaDto(this ItemVenda item) => new(
        item.ProdutoId,
        item.Nome,
        item.Quantidade,
        item.PrecoUnitario,
        item.Desconto,
        item.Total);

    public static VendaDto ParaDto(this Venda venda) => new(
        venda.Id,
        venda.VendedorId,
        venda.Vendedor?.Nome,
        venda.Subtotal,
        venda.DescontoTotal,
        venda.Total,
        venda.FormaPagamento,
        venda.Observacao,
        venda.CriadoEm,
        venda.Itens.Select(item => item.ParaDto()).ToList());

    public static VendedorDto ParaDto(this Vendedor vendedor) => new(
        vendedor.Id,
        vendedor.Nome,
        vendedor.Email,
        vendedor.Telefone,
        vendedor.Comissao,
        vendedor.TotalVendas,
        vendedor.Ativo,
        vendedor.DataEntrada);

    public static ClienteDto ParaDto(this Cliente cliente) => new(
        cliente.Id,
        cliente.Nome,
        cliente.Telefone,
        cliente.Observacoes,
        cliente.CriadoEm);

    public static ItemOrdemServicoDto ParaDto(this ItemOrdemServico item) => new(
        item.ServicoId,
        item.Nome,
        item.Descricao,
        item.ValorCobrado,
        item.Total);

    public static ServicoCatalogoDto ParaDto(this ServicoCatalogo servico) => new(
        servico.Id,
        servico.Nome,
        servico.Descricao,
        servico.PrecoPadrao,
        servico.Ativo,
        servico.CriadoEm);

    public static OrdemServicoDto ParaDto(this OrdemServico ordem, ResultadoWhatsAppDto? whatsapp = null) => new(
        ordem.Id,
        ordem.Numero,
        ordem.ClienteId,
        ordem.Cliente,
        ordem.ContatoCliente,
        ordem.TipoAparelho,
        ordem.Marca,
        ordem.Modelo,
        ordem.Aparelho,
        ordem.EstadoAparelho,
        ordem.Problema,
        ordem.Status,
        ordem.Prioridade,
        ordem.Valor,
        ordem.Data,
        ordem.Prazo,
        ordem.DataSaida,
        ordem.ItensServico.Select(item => item.ParaDto()).ToList(),
        whatsapp);

    public static UsuarioDto ParaDto(this Usuario usuario) => new(
        usuario.Id,
        usuario.NomeUsuario,
        usuario.Email,
        usuario.Funcao,
        usuario.Ativo,
        usuario.CriadoEm);

    public static MovimentoCaixaDto ParaDto(this MovimentoCaixa movimento) => new(
        movimento.Id,
        movimento.Tipo,
        movimento.Valor,
        movimento.Descricao,
        movimento.CriadoEm);

    public static ConfiguracaoLojaDto ParaDto(this ConfiguracaoLoja configuracao) => new()
    {
        Id = configuracao.Id,
        NomeLoja = configuracao.NomeLoja,
        LogoLoja = configuracao.LogoLoja,
        TelefoneLoja = configuracao.TelefoneLoja,
        EnderecoLoja = configuracao.EnderecoLoja,
        RazaoSocial = configuracao.RazaoSocial,
        Cnpj = configuracao.Cnpj,
        Cidade = configuracao.Cidade,
        Estado = configuracao.Estado,
        Cep = configuracao.Cep,
        ComprovanteIncluirLogo = configuracao.ComprovanteIncluirLogo,
        ComprovanteCabecalho = configuracao.ComprovanteCabecalho,
        ComprovanteRodape = configuracao.ComprovanteRodape,
        ComprovanteMostrarDadosFiscais = configuracao.ComprovanteMostrarDadosFiscais,
        ImpressoraNome = configuracao.ImpressoraNome,
        ImpressoraModelo = configuracao.ImpressoraModelo,
        ImpressoraLarguraPapel = configuracao.ImpressoraLarguraPapel,
        ImpressoraCorteAutomatico = configuracao.ImpressoraCorteAutomatico,
        AlertaEstoqueBaixo = configuracao.AlertaEstoqueBaixo,
        SomFinalizacao = configuracao.SomFinalizacao,
        ImpressaoAutomatica = configuracao.ImpressaoAutomatica,
        WhatsAppPhoneNumberId = configuracao.WhatsAppPhoneNumberId,
        WhatsAppConfigurado = !string.IsNullOrWhiteSpace(configuracao.WhatsAppToken)
            && !string.IsNullOrWhiteSpace(configuracao.WhatsAppPhoneNumberId),
    };

    public static void AplicarEm(this ConfiguracaoLojaDto dto, ConfiguracaoLoja configuracao)
    {
        configuracao.NomeLoja = string.IsNullOrWhiteSpace(dto.NomeLoja) ? "BRINKPDV" : dto.NomeLoja;
        configuracao.LogoLoja = dto.LogoLoja;
        configuracao.TelefoneLoja = dto.TelefoneLoja;
        configuracao.EnderecoLoja = dto.EnderecoLoja;
        configuracao.RazaoSocial = dto.RazaoSocial;
        configuracao.Cnpj = dto.Cnpj;
        configuracao.Cidade = dto.Cidade;
        configuracao.Estado = dto.Estado;
        configuracao.Cep = dto.Cep;
        configuracao.ComprovanteIncluirLogo = dto.ComprovanteIncluirLogo;
        configuracao.ComprovanteCabecalho = dto.ComprovanteCabecalho;
        configuracao.ComprovanteRodape = dto.ComprovanteRodape;
        configuracao.ComprovanteMostrarDadosFiscais = dto.ComprovanteMostrarDadosFiscais;
        configuracao.ImpressoraNome = dto.ImpressoraNome;
        configuracao.ImpressoraModelo = dto.ImpressoraModelo;
        configuracao.ImpressoraLarguraPapel = dto.ImpressoraLarguraPapel;
        configuracao.ImpressoraCorteAutomatico = dto.ImpressoraCorteAutomatico;
        configuracao.AlertaEstoqueBaixo = dto.AlertaEstoqueBaixo;
        configuracao.SomFinalizacao = dto.SomFinalizacao;
        configuracao.ImpressaoAutomatica = dto.ImpressaoAutomatica;
        configuracao.WhatsAppPhoneNumberId = string.IsNullOrWhiteSpace(dto.WhatsAppPhoneNumberId)
            ? configuracao.WhatsAppPhoneNumberId
            : dto.WhatsAppPhoneNumberId.Trim();

        if (!string.IsNullOrWhiteSpace(dto.WhatsAppToken))
        {
            configuracao.WhatsAppToken = dto.WhatsAppToken.Trim();
        }
    }
}
