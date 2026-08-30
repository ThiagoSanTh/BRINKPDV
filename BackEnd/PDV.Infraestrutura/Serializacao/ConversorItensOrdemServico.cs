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
            ServicoId = item.ServicoId,
            Nome = item.Nome,
            Descricao = item.Descricao,
            ValorCobrado = item.ValorCobrado,
            Total = item.Total,
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
                ServicoId = item.ServicoId ?? string.Empty,
                Nome = item.Nome ?? string.Empty,
                Descricao = item.Descricao,
                ValorCobrado = item.ValorCobrado,
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
                a.ServicoId == b.ServicoId &&
                a.Nome == b.Nome &&
                a.Descricao == b.Descricao &&
                a.ValorCobrado == b.ValorCobrado)
            .All(iguais => iguais);
    }

    private static int CalcularHash(List<ItemOrdemServico> itens)
    {
        var hash = new HashCode();

        foreach (var item in itens)
        {
            hash.Add(item.ServicoId);
            hash.Add(item.Nome);
            hash.Add(item.Descricao);
            hash.Add(item.ValorCobrado);
        }

        return hash.ToHashCode();
    }

    private static ItemOrdemServico Clonar(ItemOrdemServico item) => new()
    {
        ServicoId = item.ServicoId,
        Nome = item.Nome,
        Descricao = item.Descricao,
        ValorCobrado = item.ValorCobrado,
    };
}

internal sealed class ItemOrdemServicoPersistido
{
    [JsonPropertyName("servicoId")]
    public string? ServicoId { get; set; }

    [JsonPropertyName("nome")]
    public string? Nome { get; set; }

    [JsonPropertyName("descricao")]
    public string? Descricao { get; set; }

    [JsonPropertyName("valorCobrado")]
    public decimal ValorCobrado { get; set; }

    [JsonPropertyName("total")]
    public decimal Total { get; set; }
}
