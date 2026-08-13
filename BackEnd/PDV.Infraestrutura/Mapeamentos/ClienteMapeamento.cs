using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PDV.Dominio.Entidades;

namespace PDV.Infraestrutura.Mapeamentos;

public class ClienteMapeamento : IEntityTypeConfiguration<Cliente>
{
    public void Configure(EntityTypeBuilder<Cliente> builder)
    {
        builder.ToTable("clients");

        builder.HasKey(cliente => cliente.Id);

        builder.Property(cliente => cliente.Id)
            .HasColumnName("id")
            .HasColumnType("varchar");

        builder.Property(cliente => cliente.Nome)
            .HasColumnName("name")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(cliente => cliente.Telefone)
            .HasColumnName("phone")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(cliente => cliente.Observacoes)
            .HasColumnName("notes")
            .HasColumnType("text");

        builder.Property(cliente => cliente.CriadoEm)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.HasIndex(cliente => cliente.Telefone).IsUnique();

        builder.HasMany(cliente => cliente.Ordens)
            .WithOne(ordem => ordem.CadastroCliente)
            .HasForeignKey(ordem => ordem.ClienteId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
