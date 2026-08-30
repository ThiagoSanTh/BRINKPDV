using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PDV.Dominio.Entidades;
using PDV.Infraestrutura.Serializacao;

namespace PDV.Infraestrutura.Mapeamentos;

public class OrdemServicoMapeamento : IEntityTypeConfiguration<OrdemServico>
{
    public void Configure(EntityTypeBuilder<OrdemServico> builder)
    {
        builder.ToTable("service_orders");

        builder.HasKey(ordem => ordem.Id);

        builder.Ignore(ordem => ordem.DescricaoAparelho);

        builder.Property(ordem => ordem.Id)
            .HasColumnName("id")
            .HasColumnType("varchar");

        builder.Property(ordem => ordem.Numero)
            .HasColumnName("order_number")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(ordem => ordem.ClienteId)
            .HasColumnName("client_id")
            .HasColumnType("varchar");

        builder.Property(ordem => ordem.Cliente)
            .HasColumnName("customer")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(ordem => ordem.ContatoCliente)
            .HasColumnName("customer_contact")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(ordem => ordem.TipoAparelho)
            .HasColumnName("device_type")
            .HasColumnType("text")
            .HasDefaultValue(TiposAparelho.Outro)
            .IsRequired();

        builder.Property(ordem => ordem.Marca)
            .HasColumnName("device_brand")
            .HasColumnType("text")
            .HasDefaultValue(string.Empty)
            .IsRequired();

        builder.Property(ordem => ordem.Modelo)
            .HasColumnName("device_model")
            .HasColumnType("text")
            .HasDefaultValue(string.Empty)
            .IsRequired();

        builder.Property(ordem => ordem.Aparelho)
            .HasColumnName("device")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(ordem => ordem.EstadoAparelho)
            .HasColumnName("device_condition")
            .HasColumnType("text")
            .HasDefaultValue(EstadosAparelho.Bom)
            .IsRequired();

        builder.Property(ordem => ordem.Problema)
            .HasColumnName("issue")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(ordem => ordem.Status)
            .HasColumnName("status")
            .HasColumnType("text")
            .HasDefaultValue(StatusOrdemServico.Orcamento)
            .IsRequired();

        builder.Property(ordem => ordem.Prioridade)
            .HasColumnName("priority")
            .HasColumnType("text")
            .HasDefaultValue(PrioridadesOrdemServico.Media)
            .IsRequired();

        builder.Property(ordem => ordem.Valor)
            .HasColumnName("value")
            .HasColumnType("numeric(10,2)")
            .IsRequired();

        builder.Property(ordem => ordem.Itens)
            .HasColumnName("items")
            .HasColumnType("text")
            .HasDefaultValue("[]")
            .HasConversion(new ConversorItensOrdemServico(), new ComparadorItensOrdemServico())
            .IsRequired();

        builder.Property(ordem => ordem.Data)
            .HasColumnName("date")
            .HasColumnType("date")
            .IsRequired();

        builder.Property(ordem => ordem.Prazo)
            .HasColumnName("deadline")
            .HasColumnType("date")
            .IsRequired();

        builder.Property(ordem => ordem.DataSaida)
            .HasColumnName("exit_date")
            .HasColumnType("date");

        builder.HasIndex(ordem => ordem.Numero).IsUnique();
        builder.HasIndex(ordem => ordem.ClienteId);
    }
}
