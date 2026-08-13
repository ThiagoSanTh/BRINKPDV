using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PDV.Dominio.Entidades;
using PDV.Infraestrutura.Serializacao;

namespace PDV.Infraestrutura.Mapeamentos;

public class VendaMapeamento : IEntityTypeConfiguration<Venda>
{
    public void Configure(EntityTypeBuilder<Venda> builder)
    {
        builder.ToTable("sales");

        builder.HasKey(venda => venda.Id);

        builder.Ignore(venda => venda.Subtotal);
        builder.Ignore(venda => venda.DescontoTotal);

        builder.Property(venda => venda.Id)
            .HasColumnName("id")
            .HasColumnType("varchar");

        builder.Property(venda => venda.VendedorId)
            .HasColumnName("salesperson_id")
            .HasColumnType("varchar");

        builder.Property(venda => venda.Total)
            .HasColumnName("total")
            .HasColumnType("numeric(10,2)")
            .IsRequired();

        builder.Property(venda => venda.FormaPagamento)
            .HasColumnName("payment_method")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(venda => venda.Itens)
            .HasColumnName("items")
            .HasColumnType("text")
            .HasConversion(new ConversorItensVenda(), new ComparadorItensVenda())
            .IsRequired();

        builder.Property(venda => venda.Observacao)
            .HasColumnName("observation")
            .HasColumnType("text");

        builder.Property(venda => venda.CriadoEm)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone");

        builder.HasOne(venda => venda.Vendedor)
            .WithMany()
            .HasForeignKey(venda => venda.VendedorId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(venda => venda.CriadoEm);
    }
}
