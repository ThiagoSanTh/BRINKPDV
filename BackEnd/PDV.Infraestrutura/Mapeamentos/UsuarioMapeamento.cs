using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PDV.Dominio.Entidades;

namespace PDV.Infraestrutura.Mapeamentos;

public class UsuarioMapeamento : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("users");

        builder.HasKey(usuario => usuario.Id);

        builder.Property(usuario => usuario.Id)
            .HasColumnName("id")
            .HasColumnType("varchar");

        builder.Property(usuario => usuario.NomeUsuario)
            .HasColumnName("username")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(usuario => usuario.SenhaHash)
            .HasColumnName("password")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(usuario => usuario.Email)
            .HasColumnName("email")
            .HasColumnType("text");

        builder.Property(usuario => usuario.Funcao)
            .HasColumnName("role")
            .HasColumnType("text")
            .HasDefaultValue(FuncoesUsuario.Vendedor)
            .IsRequired();

        builder.Property(usuario => usuario.Ativo)
            .HasColumnName("active")
            .HasDefaultValue(true);

        builder.Property(usuario => usuario.CriadoEm)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone");

        builder.HasIndex(usuario => usuario.NomeUsuario).IsUnique();
    }
}
