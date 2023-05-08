package com.project.server.security;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.server.constants.Constants;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import static com.project.server.constants.SystemConstants.*;

public class JWTAuthorizationFilter extends OncePerRequestFilter {

    private JWTProperties jwtProperties;
    private String bearer = "Bearer ";

    public JWTAuthorizationFilter(JWTProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getServletPath();
        if (path.equals(GET_TOKEN_ROUTE) || path.equals(REFRESH_TOKEN_ROUTE)) {
            filterChain.doFilter(request, response);
        } else {
            String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

            if (Objects.nonNull(authorizationHeader) && authorizationHeader.startsWith(bearer)) {
                try {
                    String accessToken = authorizationHeader.substring(bearer.length());
                    Algorithm algorithm = Algorithm.HMAC256(jwtProperties.getSecret().getBytes());
                    JWTVerifier jwtVerifier = JWT.require(algorithm).build();
                    DecodedJWT decodedJWT = jwtVerifier.verify(accessToken);
                    List<String> roles = decodedJWT.getClaim("roles").asList(String.class);
                    List<SimpleGrantedAuthority> authorities = roles
                        .stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
                    UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(decodedJWT.getSubject(), null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    filterChain.doFilter(request, response);
                } catch (Exception e) {
                    ObjectMapper objectMapper = new ObjectMapper();
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    objectMapper.writeValue(response.getOutputStream(), Constants.ACCESSTOKEN_NOT_VALID_ERROR_MESSAGE);
                }
    
            } else {
                filterChain.doFilter(request, response);
            }
        }
    }
}
