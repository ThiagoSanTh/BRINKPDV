using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using PDV.Servico.Dtos;
using PDV.WebApi.Configuracao;

namespace PDV.WebApi.Autenticacao;

public class GeradorTokenJwt
{
    public const string ClaimNomeUsuario = "nomeUsuario";

    private readonly OpcoesJwt _opcoes;

    public GeradorTokenJwt(IOptions<OpcoesJwt> opcoes)
    {
        _opcoes = opcoes.Value;
    }

    public (string Token, DateTime Expiracao) Gerar(UsuarioDto usuario)
    {
        var chave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opcoes.Chave));
        var credenciais = new SigningCredentials(chave, SecurityAlgorithms.HmacSha256);
        var expiracao = DateTime.UtcNow.AddHours(_opcoes.HorasValidade);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id),
            new(ClaimNomeUsuario, usuario.NomeUsuario),
            new(ClaimTypes.Role, usuario.Funcao),
        };

        var token = new JwtSecurityToken(
            issuer: _opcoes.Emissor,
            audience: _opcoes.Audiencia,
            claims: claims,
            expires: expiracao,
            signingCredentials: credenciais);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiracao);
    }
}
