using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PDV.Dominio.Entidades;

namespace PDV.Infraestrutura.Serializacao;

public class ConversorItensOrdemServico : ValueConverter<List<ItemOrdemServico>, string>
{
    public ConversorItensOrdemServico()
        : base(
            itens => Serializar(itens),
            texto => Desserializar(texto))
    {
    }

    private static readonly JsonSerializerOptions Opcoes = new()
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private static string Serializar(List<ItemOrdemServico> itens)
    {
        var persistidos = itens.Select(item => new ItemOrdemServicoPersistido
        {
            ProductId = item.ProdutoId,
            ServiceId = item.ServicoId,
            Type = string.IsNullOrWhiteSpace(item.Tipo) ? TiposItemTransacional.Servico : item.Tipo,
            Name = item.Nome,
            Quantity = item.Quantidade,
            Price = item.PrecoUnitario,
        });

        return JsonSerializer.Serialize(persistidos, Opcoes);
    }

    private static List<ItemOrdemServico> Desserializar(string texto)
    {
        if (string.IsNullOrWhiteSpace(texto))
        {
            return [];
        }

        var persistidos = JsonSerializer.Deserialize<List<ItemOrdemServicoPersistido>>(texto, Opcoes) ?? [];

        return persistidos
            .Select(item => new ItemOrdemServico
            {
                ProdutoId = item.ProductId,
                ServicoId = item.ServiceId,
                Tipo = string.IsNullOrWhiteSpace(item.Type) ? TiposItemTransacional.Servico : item.Type,
                Nome = item.Name ?? string.Empty,
                Quantidade = item.Quantity <= 0 ? 1 : item.Quantity,
                PrecoUnitario = item.Price,
            })
            .ToList();
    }
}

public class ComparadorItensOrdemServico : ValueComparer<List<ItemOrdemServico>>
{
    public ComparadorItensOrdemServico()
        : base(
            (esquerda, direita) => SaoIguais(esquerda, direita),
            itens => CalcularHash(itens),
            itens => itens.Select(Clonar).ToList())
    {
    }

    private static bool SaoIguais(List<ItemOrdemServico>? esquerda, List<ItemOrdemServico>? direita)
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
                a.ServicoId == b.ServicoId &&
                a.Tipo == b.Tipo &&
                a.Nome == b.Nome &&
                a.Quantidade == b.Quantidade &&
                a.PrecoUnitario == b.PrecoUnitario)
            .All(iguais => iguais);
    }

    private static int CalcularHash(List<ItemOrdemServico> itens)
    {
        var hash = new HashCode();

        foreach (var item in itens)
        {
            hash.Add(item.ProdutoId);
            hash.Add(item.ServicoId);
            hash.Add(item.Tipo);
            hash.Add(item.Nome);
            hash.Add(item.Quantidade);
            hash.Add(item.PrecoUnitario);
        }

        return hash.ToHashCode();
    }

    private static ItemOrdemServico Clonar(ItemOrdemServico item) => new()
    {
        ProdutoId = item.ProdutoId,
        ServicoId = item.ServicoId,
        Tipo = item.Tipo,
        Nome = item.Nome,
        Quantidade = item.Quantidade,
        PrecoUnitario = item.PrecoUnitario,
    };
}

internal sealed class ItemOrdemServicoPersistido
{
    [JsonPropertyName("productId")]
    public string? ProductId { get; set; }

    [JsonPropertyName("serviceId")]
    public string? ServiceId { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("quantity")]
    public int Quantity { get; set; }

    [JsonPropertyName("price")]
    public decimal Price { get; set; }
}
