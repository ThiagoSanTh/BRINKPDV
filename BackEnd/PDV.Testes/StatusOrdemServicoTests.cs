using PDV.Dominio.Entidades;

namespace PDV.Testes;

public class StatusOrdemServicoTests
{
    [Theory]
    [InlineData(StatusOrdemServico.Orcamento, true)]
    [InlineData(StatusOrdemServico.AguardandoAprovacao, true)]
    [InlineData(StatusOrdemServico.EmAndamento, true)]
    [InlineData(StatusOrdemServico.AguardandoPeca, true)]
    [InlineData(StatusOrdemServico.ProntoParaRetirada, true)]
    [InlineData(StatusOrdemServico.Entregue, false)]
    [InlineData(StatusOrdemServico.Cancelada, false)]
    [InlineData("Concluída", false)]
    public void EstaEmAndamento_RefleteStatusEncerrado(string status, bool esperado)
    {
        Assert.Equal(esperado, StatusOrdemServico.EstaEmAndamento(status));
    }

    [Fact]
    public void EstaEmAndamento_NormalizaStatusLegado()
    {
        Assert.False(StatusOrdemServico.EstaEmAndamento("Concluída"));
        Assert.True(StatusOrdemServico.EstaEmAndamento(StatusOrdemServico.EmAndamento));
    }
}
