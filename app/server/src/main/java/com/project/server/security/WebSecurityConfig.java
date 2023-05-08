package com.project.server.security;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import static com.project.server.constants.SystemConstants.*;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled=true)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
	@Autowired
	private UserDetailsServiceImplementation userDetailsService;
	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	JWTService jwtService;

    @Override
	protected void configure(HttpSecurity http) throws Exception {
		JWTAuthenticationFilter jwtAuthenticationFilter = new JWTAuthenticationFilter(authenticationManagerBean(), jwtService, jwtPropertiesBean());
		jwtAuthenticationFilter.setFilterProcessesUrl(GET_TOKEN_ROUTE);
		http.csrf().disable();
		http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
		http.addFilter(jwtAuthenticationFilter);
		http.addFilterBefore(new JWTAuthorizationFilter(jwtPropertiesBean()), UsernamePasswordAuthenticationFilter.class);
	}

	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {
		auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder);
	}

	@Bean
	@Override
	public AuthenticationManager authenticationManagerBean() throws Exception {
		return super.authenticationManagerBean();
	}

	@Bean
	public JWTProperties jwtPropertiesBean() {
		return new JWTProperties();
	}
}
