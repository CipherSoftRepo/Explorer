using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ExplorerAPI.Models;
using ExplorerAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ExplorerAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class FilesController : ControllerBase
    {
        private readonly ILogger<FilesController> _logger;
        private readonly ExplorerService _service;

        public FilesController(ILogger<FilesController> logger, ExplorerService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet]
        public async Task<IEnumerable<FileModel>> GetAllRoot()
        {
            var result = await _service.GetAllRootFiles();
            return result;
        }

        [HttpGet]
        [Route("{parentId:guid}/files")]
        public async Task<IEnumerable<FileModel>> GetAllForParent(Guid parentId)
        {
            var result = await _service.GetForParent(parentId);
            return result;
        }

        [HttpPost]
        [Route("search")]
        public async Task<IEnumerable<FileModel>> Search([FromBody] SearchQuery query)
        {
            var result = await _service.SearchTopX(query);
            return result;
        }

        [HttpGet]
        [Route("{id:guid}")]
        public async Task<FileModel> Get(Guid id)
        {
            var result = await _service.Get(id);
            return result;
        }

        [HttpPost]
        public async Task<FileModel> Create([FromBody] FileModelBMO model)
        {
            var result = await _service.Create(model);
            return result;
        }

        [HttpPut]
        [Route("{id:guid}")]
        public async Task<FileModel> Edit(Guid id, [FromBody] FileModelBMO model)
        {
            var result = await _service.Edit(id, model);
            return result;
        }

        [HttpDelete]
        [Route("{id:guid}")]
        public async Task Delete(Guid id)
        {
            await _service.Delete(id);
        }
    }
}
