using ExplorerAPI.DB;
using ExplorerAPI.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExplorerAPI.Services
{
    public class ExplorerService
    {
        private readonly ExplorerDBContext _db;

        public ExplorerService(ExplorerDBContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<FileModel>> SearchTopX(SearchQuery searchQuery, int numOfResults = 10)
        {
            if (numOfResults <= 0)
            {
                numOfResults = 10;
            }

            var queryLowercase = searchQuery.Query.ToLower();

            var dbQuery = GetEntities();

            if (searchQuery.Global == false)
            {
                dbQuery = dbQuery.Where(x => x.ParentFolderId == searchQuery.ParentId);
            }

            if (searchQuery.ExactMatch)
            {
                dbQuery = dbQuery.Where(x => x.Name.ToLower() == queryLowercase);
            }
            else
            {
                dbQuery = dbQuery.Where(x => x.Name.ToLower().StartsWith(queryLowercase));
            }

            return await dbQuery.Take(numOfResults).ToListAsync();
        }

        public async Task<IEnumerable<FileModel>> GetAllRootFiles()
        {
            return await GetEntities().Where(f => f.ParentFolderId == null).ToListAsync();
        }

        public async Task<IEnumerable<FileModel>> GetForParent(Guid parentId)
        {
            return await GetEntities().Where(x => x.ParentFolderId == parentId).ToListAsync();
        }

        public async Task<FileModel> Get(Guid id)
        {
            return await GetEntities().SingleOrDefaultAsync(x => x.Id == id);
        }

        public async Task<FileModel> Create(FileModelBMO model)
        {
            if (model.ParentFolderId != null)
            {
                // check if parent is folder or not
                var parent = await _db.Files.SingleOrDefaultAsync(x => x.Id == model.ParentFolderId);
                if (parent.IsFolder == false)
                {
                    throw new Exception("Parent must be folder!");
                }
            }

            var newFile = new FileModel
            {
                IsFolder = model.IsFolder,
                Name = model.Name,
                LastModifiedDate = DateTime.UtcNow,
                ParentFolderId = model.ParentFolderId
            };

            _db.Files.Add(newFile);
            await _db.SaveChangesAsync();

            return await GetEntities().SingleOrDefaultAsync(x => x.Id == newFile.Id);
        }

        public async Task<FileModel> Edit(Guid id, FileModelBMO model)
        {
            if (model.ParentFolderId != null)
            {
                // check if parent is folder or not
                var parent = await _db.Files.SingleOrDefaultAsync(x => x.Id == model.ParentFolderId);
                if (parent.IsFolder == false)
                {
                    throw new Exception("Parent must be folder!");
                }
            }

            var file = await GetEntities().SingleOrDefaultAsync(x => x.Id == id);
            if (file == null)
            {
                throw new Exception("File/folder does not exists!");
            }

            file.Name = model.Name;
            file.ParentFolderId = model.ParentFolderId;
            file.LastModifiedDate = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return file;
        }

        public async Task Delete(Guid id)
        {
            var file = await _db.Files.SingleOrDefaultAsync(x => x.Id == id);
            if (file != null)
            {
                _db.Files.Remove(file);
                await _db.SaveChangesAsync();
            }
        }

        private IQueryable<FileModel> GetEntities()
        {
            return _db.Files.Include(f => f.Parent);
        }
    }
}
