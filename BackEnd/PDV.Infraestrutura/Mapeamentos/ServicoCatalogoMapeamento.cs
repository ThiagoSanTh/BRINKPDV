using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PDV.Dominio.Entidades;

namespace PDV.Infraestrutura.Mapeamentos;

public class ServicoCatalogoMapeamento : IEntityTypeConfiguration<ServicoCatalogo>
{
    public void Configure(EntityTypeBuilder<ServicoCatalogo> builder)
    {
        builder.ToTable("services");

        builder.HasKey(servico => servico.Id);

        builder.Property(servico => servico.Id)
            .HasColumnName("id")
            .HasColumnType("varchar");

        builder.Property(servico => servico.Nome)
            .HasColumnName("name")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(servico => servico.Descricao)
            .HasColumnName("description")
            .HasColumnType("text");

        builder.Property(servico => servico.PrecoPadrao)
            .HasColumnName("default_price")
            .HasColumnType("numeric(10,2)");

        builder.Property(servico => servico.Ativo)
            .HasColumnName("active")
            .HasColumnType("boolean")
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(servico => servico.CriadoEm)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.HasIndex(servico => servico.Nome).IsUnique();
    }
}
