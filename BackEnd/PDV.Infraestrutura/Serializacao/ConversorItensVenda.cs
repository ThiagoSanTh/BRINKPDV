using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PDV.Dominio.Entidades;

namespace PDV.Infraestrutura.Serializacao;

public class ConversorItensVenda : ValueConverter<List<ItemVenda>, string>
{
    public ConversorItensVenda()
        : base(
            itens => Serializar(itens),
            texto => Desserializar(texto))
    {
    }

    private static readonly JsonSerializerOptions Opcoes = new()
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private static string Serializar(List<ItemVenda> itens)
    {
        var persistidos = itens.Select(item => new ItemVendaPersistido
        {
            ProductId = item.ProdutoId,
            Name = item.Nome,
            Quantity = item.Quantidade,
            Price = item.PrecoUnitario,
            Discount = item.Desconto,
        });

        return JsonSerializer.Serialize(persistidos, Opcoes);
    }

    private static List<ItemVenda> Desserializar(string texto)
    {
        if (string.IsNullOrWhiteSpace(texto))
        {
            return [];
        }

        var persistidos = JsonSerializer.Deserialize<List<ItemVendaPersistido>>(texto, Opcoes) ?? [];

        return persistidos
            .Select(item => new ItemVenda
            {
                ProdutoId = item.ProductId ?? string.Empty,
                Nome = item.Name ?? string.Empty,
                Quantidade = item.Quantity,
                PrecoUnitario = item.Price,
                Desconto = item.Discount,
            })
            .ToList();
    }
}

public class ComparadorItensVenda : ValueComparer<List<ItemVenda>>
{
    public ComparadorItensVenda()
        : base(
            (esquerda, direita) => SaoIguais(esquerda, direita),
            itens => CalcularHash(itens),
            itens => itens.Select(Clonar).ToList())
    {
    }

    private static bool SaoIguais(List<ItemVenda>? esquerda, List<ItemVenda>? direita)
    {
        if (esquerda is null || direita is null)
        {
            return esquerda is null && direita is null;
        }

        if (esquerda.Count != direita.Count)
        {
            return false;
        }

        return esquerda
            .Zip(direita, (a, b) =>
                a.ProdutoId == b.ProdutoId &&
                a.Nome == b.Nome &&
                a.Quantidade == b.Quantidade &&
                a.PrecoUnitario == b.PrecoUnitario &&
                a.Desconto == b.Desconto)
            .All(iguais => iguais);
    }

    private static int CalcularHash(List<ItemVenda> itens)
    {
        var hash = new HashCode();

        foreach (var item in itens)
        {
            hash.Add(item.ProdutoId);
            hash.Add(item.Nome);
            hash.Add(item.Quantidade);
            hash.Add(item.PrecoUnitario);
            hash.Add(item.Desconto);
        }

        return hash.ToHashCode();
    }

    private static ItemVenda Clonar(ItemVenda item) => new()
    {
        ProdutoId = item.ProdutoId,
        Nome = item.Nome,
        Quantidade = item.Quantidade,
        PrecoUnitario = item.PrecoUnitario,
        Desconto = item.Desconto,
    };
}

internal sealed class ItemVendaPersistido
{
    [JsonPropertyName("productId")]
    public string? ProductId { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("quantity")]
    public int Quantity { get; set; }

    [JsonPropertyName("price")]
    public decimal Price { get; set; }

    [JsonPropertyName("discount")]
    public decimal Discount { get; set; }
}
