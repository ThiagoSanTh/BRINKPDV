namespace PDV.Servico.Dtos;

public record CategoriaResumoDto(string Nome, int Quantidade);

public class RenomearCategoriaDto
{
    public string NomeAtual { get; set; } = string.Empty;
    public string NomeNovo { get; set; } = string.Empty;
}

public record RenomearCategoriaResultadoDto(string NomeAnterior, string NomeNovo, int ProdutosAtualizados);

public record ServicoCatalogoDto(
    string Id,
    string Nome,
    string? Descricao,
    decimal? PrecoPadrao,
    bool Ativo,
    DateTime CriadoEm);

public class ServicoCatalogoEntradaDto
{
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public decimal? PrecoPadrao { get; set; }
    public bool Ativo { get; set; } = true;
}

public record ItemOrdemServicoDto(
    string ServicoId,
    string Nome,
    string? Descricao,
    decimal ValorCobrado,
    decimal Total);

public class ItemOrdemServicoEntradaDto
{
    public string ServicoId { get; set; } = string.Empty;
    public string? Nome { get; set; }
    public string? Descricao { get; set; }
    public decimal ValorCobrado { get; set; }
}
