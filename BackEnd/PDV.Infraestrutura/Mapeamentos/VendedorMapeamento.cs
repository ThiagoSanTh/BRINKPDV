using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PDV.Dominio.Entidades;

namespace PDV.Infraestrutura.Mapeamentos;

public class VendedorMapeamento : IEntityTypeConfiguration<Vendedor>
{
    public void Configure(EntityTypeBuilder<Vendedor> builder)
    {
        builder.ToTable("salespersons");

        builder.HasKey(vendedor => vendedor.Id);

        builder.Property(vendedor => vendedor.Id)
            .HasColumnName("id")
            .HasColumnType("varchar");

        builder.Property(vendedor => vendedor.Nome)
            .HasColumnName("name")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(vendedor => vendedor.Email)
            .HasColumnName("email")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(vendedor => vendedor.Telefone)
            .HasColumnName("phone")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(vendedor => vendedor.Comissao)
            .HasColumnName("commission")
            .HasColumnType("numeric(5,2)")
            .IsRequired();

        builder.Property(vendedor => vendedor.TotalVendas)
            .HasColumnName("total_sales")
            .HasColumnType("numeric(10,2)")
            .HasDefaultValue(0m)
            .IsRequired();

        builder.Property(vendedor => vendedor.Ativo)
            .HasColumnName("active")
            .HasColumnType("boolean")
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(vendedor => vendedor.DataEntrada)
            .HasColumnName("entry_date")
            .HasColumnType("date")
            .IsRequired();

        builder.HasIndex(vendedor => vendedor.Email).IsUnique();
    }
}
