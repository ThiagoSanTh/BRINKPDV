using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PDV.Dominio.Entidades;

namespace PDV.Infraestrutura.Mapeamentos;

public class MovimentoCaixaMapeamento : IEntityTypeConfiguration<MovimentoCaixa>
{
    public void Configure(EntityTypeBuilder<MovimentoCaixa> builder)
    {
        builder.ToTable("cash_movements");

        builder.HasKey(movimento => movimento.Id);

        builder.Property(movimento => movimento.Id)
            .HasColumnName("id")
            .HasColumnType("varchar");

        builder.Property(movimento => movimento.Tipo)
            .HasColumnName("type")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(movimento => movimento.Valor)
            .HasColumnName("amount")
            .HasColumnType("numeric(10,2)")
            .IsRequired();

        builder.Property(movimento => movimento.Descricao)
            .HasColumnName("description")
            .HasColumnType("text");

        builder.Property(movimento => movimento.CriadoEm)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone");

        builder.HasIndex(movimento => movimento.CriadoEm);
    }
}
