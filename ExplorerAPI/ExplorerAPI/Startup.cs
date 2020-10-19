using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExplorerAPI.DB;
using ExplorerAPI.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace ExplorerAPI
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors();

            services.AddControllers();

            services.AddSwaggerGen();

            services.AddDbContext<ExplorerDBContext>();
            services.AddScoped<ExplorerService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ExplorerDBContext dataContext)
        {
            // migrate any database changes on startup (includes initial db creation)
            dataContext.Database.Migrate();

            if (env.IsDevelopment())
            {
                app.UseCors(
                options => options.WithOrigins("http://localhost:3000").AllowAnyMethod().AllowAnyHeader().AllowCredentials()
            );

                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();

            app.UseSwagger();

            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Explorer API V1");
            });

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
