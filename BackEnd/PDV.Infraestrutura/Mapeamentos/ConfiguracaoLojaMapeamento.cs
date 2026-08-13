using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PDV.Dominio.Entidades;

namespace PDV.Infraestrutura.Mapeamentos;

public class ConfiguracaoLojaMapeamento : IEntityTypeConfiguration<ConfiguracaoLoja>
{
    public void Configure(EntityTypeBuilder<ConfiguracaoLoja> builder)
    {
        builder.ToTable("store_settings");

        builder.HasKey(configuracao => configuracao.Id);

        builder.Property(configuracao => configuracao.Id)
            .HasColumnName("id")
            .HasColumnType("varchar");

        builder.Property(configuracao => configuracao.NomeLoja)
            .HasColumnName("store_name")
            .HasColumnType("text")
            .HasDefaultValue("BRINKPDV")
            .IsRequired();

        builder.Property(configuracao => configuracao.LogoLoja)
            .HasColumnName("store_logo")
            .HasColumnType("text");

        builder.Property(configuracao => configuracao.TelefoneLoja)
            .HasColumnName("store_phone")
            .HasColumnType("text");

        builder.Property(configuracao => configuracao.EnderecoLoja)
            .HasColumnName("store_address")
            .HasColumnType("text");

        builder.Property(configuracao => configuracao.RazaoSocial)
            .HasColumnName("legal_name")
            .HasColumnType("text");

        builder.Property(configuracao => configuracao.Cnpj)
            .HasColumnName("cnpj")
            .HasColumnType("text");

        builder.Property(configuracao => configuracao.Cidade)
            .HasColumnName("city")
            .HasColumnType("text");

        builder.Property(configuracao => configuracao.Estado)
            .HasColumnName("state")
            .HasColumnType("text");

        builder.Property(configuracao => configuracao.Cep)
            .HasColumnName("cep")
            .HasColumnType("text");

        builder.Property(configuracao => configuracao.ComprovanteIncluirLogo)
            .HasColumnName("receipt_include_logo")
            .HasDefaultValue(true);

        builder.Property(configuracao => configuracao.ComprovanteCabecalho)
            .HasColumnName("receipt_header")
            .HasColumnType("text");

        builder.Property(configuracao => configuracao.ComprovanteRodape)
            .HasColumnName("receipt_footer")
            .HasColumnType("text");

        builder.Property(configuracao => configuracao.ComprovanteMostrarDadosFiscais)
            .HasColumnName("receipt_show_fiscal_data")
            .HasDefaultValue(false);

        builder.Property(configuracao => configuracao.ImpressoraNome)
            .HasColumnName("printer_name")
            .HasColumnType("text");

        builder.Property(configuracao => configuracao.ImpressoraModelo)
            .HasColumnName("printer_model")
            .HasColumnType("text");

        builder.Property(configuracao => configuracao.ImpressoraLarguraPapel)
            .HasColumnName("paper_width")
            .HasColumnType("text");

        builder.Property(configuracao => configuracao.ImpressoraCorteAutomatico)
            .HasColumnName("printer_auto_cut")
            .HasDefaultValue(true);

        builder.Property(configuracao => configuracao.AlertaEstoqueBaixo)
            .HasColumnName("stock_alerts")
            .HasDefaultValue(true);

        builder.Property(configuracao => configuracao.SomFinalizacao)
            .HasColumnName("checkout_sound")
            .HasDefaultValue(false);

        builder.Property(configuracao => configuracao.ImpressaoAutomatica)
            .HasColumnName("auto_print")
            .HasDefaultValue(true);

        builder.Property(configuracao => configuracao.WhatsAppToken)
            .HasColumnName("whatsapp_token")
            .HasColumnType("text");

        builder.Property(configuracao => configuracao.WhatsAppPhoneNumberId)
            .HasColumnName("whatsapp_phone_number_id")
            .HasColumnType("text");
    }
}
