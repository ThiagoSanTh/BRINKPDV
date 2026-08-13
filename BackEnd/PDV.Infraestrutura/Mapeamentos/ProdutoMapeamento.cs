using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PDV.Dominio.Entidades;

namespace PDV.Infraestrutura.Mapeamentos;

public class ProdutoMapeamento : IEntityTypeConfiguration<Produto>
{
    public void Configure(EntityTypeBuilder<Produto> builder)
    {
        builder.ToTable("products");

        builder.HasKey(produto => produto.Id);

        builder.Ignore(produto => produto.EstoqueBaixo);

        builder.Property(produto => produto.Id)
            .HasColumnName("id")
            .HasColumnType("varchar");

        builder.Property(produto => produto.Sku)
            .HasColumnName("sku")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(produto => produto.Nome)
            .HasColumnName("name")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(produto => produto.Categoria)
            .HasColumnName("category")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(produto => produto.Preco)
            .HasColumnName("price")
            .HasColumnType("numeric(10,2)")
            .IsRequired();

        builder.Property(produto => produto.PrecoCusto)
            .HasColumnName("cost_price")
            .HasColumnType("numeric(10,2)");

        builder.Property(produto => produto.Estoque)
            .HasColumnName("stock")
            .HasColumnType("integer")
            .HasDefaultValue(0)
            .IsRequired();

        builder.Property(produto => produto.CodigoBarras)
            .HasColumnName("barcode")
            .HasColumnType("text");

        builder.Property(produto => produto.Imagem)
            .HasColumnName("image")
            .HasColumnType("text");

        builder.HasIndex(produto => produto.Sku).IsUnique();
    }
}
