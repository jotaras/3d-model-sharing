package com.project.server.security;

import java.util.Calendar;
import java.util.Objects;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.project.server.constants.Constants;
import com.project.server.dao.UserDAO;
import com.project.server.domain.User;
import com.project.server.exceptions.NoRefreshTokenException;
import com.project.server.exceptions.RefreshTokenNotValidException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class JWTService {
    @Autowired
    private JWTProperties jwtProperties;

    @Autowired
    private UserDAO userDAO;
    private String bearer = "Bearer ";

    public String createAccessToken(AuthenticatedUser authUser) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(System.currentTimeMillis());
        calendar.add(Calendar.MINUTE, jwtProperties.getAccessTokenExpiry());
        
        Algorithm algorithm = Algorithm.HMAC256(jwtProperties.getSecret().getBytes());
        return JWT.create()
            .withExpiresAt(calendar.getTime())
            .withSubject(authUser.getUserId().toString())
            .withClaim("roles", authUser.getAuthorities().stream().map(authority -> authority.getAuthority()).collect(Collectors.toList()))
            .sign(algorithm);
    }

    public String createRefreshToken(AuthenticatedUser authUser) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(System.currentTimeMillis());
        calendar.add(Calendar.DATE, jwtProperties.getRefreshTokenExpiry());

        Algorithm algorithm = Algorithm.HMAC256(jwtProperties.getSecret().getBytes());
        return JWT.create()
            .withSubject(authUser.getUserId().toString())
            .withExpiresAt(calendar.getTime())
            .sign(algorithm);
    }

    public String refreshToken(HttpServletRequest request) {
        String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(System.currentTimeMillis());
        calendar.add(Calendar.MINUTE, jwtProperties.getAccessTokenExpiry());

        if (Objects.nonNull(authorizationHeader) && authorizationHeader.startsWith(bearer)) {
            try {
                String refreshToken = authorizationHeader.substring(bearer.length());
                Algorithm algorithm = Algorithm.HMAC256(jwtProperties.getSecret().getBytes());
                JWTVerifier jwtVerifier = JWT.require(algorithm).build();
                DecodedJWT decodedJWT = jwtVerifier.verify(refreshToken);
                String userId = decodedJWT.getSubject();
                User user = userDAO.getUserById(Integer.parseInt(userId));
                return JWT.create()
                    .withExpiresAt(calendar.getTime())
                    .withSubject(userId)
                    .withClaim("roles", userDAO.getUserRoles(user.getId()).stream().map(role -> role.getName()).collect(Collectors.toList()))
                    .sign(algorithm);
            } catch(Exception e) {
                throw new RefreshTokenNotValidException(Constants.REFRESH_TOKEN_NOT_VALID_ERROR_MESSAGE);
            }
        } else {
            throw new NoRefreshTokenException(Constants.NO_REFRESH_TOKEN_ERROR_MESSAGE);
        }
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
}
